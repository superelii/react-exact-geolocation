/**
 * 请求队列管理器
 * 用于弱网环境下的请求优化
 */

interface QueuedRequest {
  id: string;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  priority: number;
  retryCount: number;
  maxRetries: number;
}

/**
 * 创建请求队列
 */
export const createRequestQueue = (
  options: {
    concurrency?: number;
    retryDelay?: number;
    maxRetries?: number;
  } = {}
) => {
  const { concurrency = 1, retryDelay = 1000, maxRetries = 3 } = options;

  const queue: QueuedRequest[] = [];
  let running = 0;
  let paused = false;

  const processQueue = async () => {
    if (paused || running >= concurrency || queue.length === 0) {
      return;
    }

    // 按优先级排序
    queue.sort((a, b) => b.priority - a.priority);

    const request = queue.shift();
    if (!request) return;

    running++;

    try {
      const result = await request.execute();
      request.resolve(result);
    } catch (error) {
      if (request.retryCount < request.maxRetries) {
        // 重试
        request.retryCount++;
        queue.push(request);

        // 延迟重试（指数退避）
        const delay = retryDelay * Math.pow(2, request.retryCount - 1);
        setTimeout(processQueue, delay);
      } else {
        request.reject(error);
      }
    } finally {
      running--;
      processQueue();
    }
  };

  return {
    /**
     * 添加请求到队列
     */
    add: <T>(execute: () => Promise<T>, priority = 0, customMaxRetries?: number): Promise<T> => {
      return new Promise((resolve, reject) => {
        queue.push({
          id: Math.random().toString(36).substr(2, 9),
          execute,
          resolve,
          reject,
          priority,
          retryCount: 0,
          maxRetries: customMaxRetries ?? maxRetries,
        });

        processQueue();
      });
    },

    /**
     * 暂停队列
     */
    pause: () => {
      paused = true;
    },

    /**
     * 恢复队列
     */
    resume: () => {
      paused = false;
      processQueue();
    },

    /**
     * 清空队列
     */
    clear: () => {
      queue.length = 0;
    },

    /**
     * 获取队列状态
     */
    getStatus: () => ({
      pending: queue.length,
      running,
      paused,
    }),
  };
};

/**
 * 全局请求队列实例
 */
let globalQueue: ReturnType<typeof createRequestQueue> | null = null;

export const getGlobalRequestQueue = () => {
  if (!globalQueue) {
    globalQueue = createRequestQueue({
      concurrency: 2, // 弱网环境下限制并发
      retryDelay: 2000, // 2秒基础重试延迟
      maxRetries: 2, // 最多重试2次
    });
  }
  return globalQueue;
};

/**
 * 使用队列包装fetch请求
 */
export const queuedFetch = async (url: string, options?: RequestInit, priority = 0): Promise<Response> => {
  const queue = getGlobalRequestQueue();

  return queue.add(() => fetch(url, options), priority);
};
