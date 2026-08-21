// i3_interview_rapidfire / ex3 - reference solution (author only, used by `dojo verify`).

export async function withDeadline<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(Object.assign(new Error(message), { code: "ETIMEDOUT" }));
    }, ms);
  });

  try {
    return await Promise.race([promise, deadline]);
  } finally {
    clearTimeout(timer);
  }
}
