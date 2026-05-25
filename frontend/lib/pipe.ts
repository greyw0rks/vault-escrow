export function pipe<T>(...fns: ((v: T) => T)[]): (v: T) => T {
  return (v: T) => fns.reduce((acc, fn) => fn(acc), v);
}

export function compose<T>(...fns: ((v: T) => T)[]): (v: T) => T {
  return pipe(...fns.reverse());
}

export function identity<T>(v: T): T { return v; }

export function constant<T>(v: T): () => T { return () => v; }
