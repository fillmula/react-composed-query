import axios, { AxiosPromise, AxiosRequestConfig } from 'axios'

interface Next {
    (request: AxiosRequestConfig): AxiosPromise
}

export interface Middleware {
    (request: AxiosRequestConfig, next: Next): AxiosPromise
}

export function host(host: string): Middleware {
    return async (request, next) => {
        request.url = host + request.url
        return await next(request)
    }
}

export function bearerToken(getter: () => string): Middleware {
    return async (request, next) => {
        if (!request.headers) {
            request.headers = {}
        }
        request.headers['authorization'] = `Bearer ${getter()}`
        return await next(request)
    }
}

export function unwrap(keypath: string = 'data'): Middleware {
    return async (request, next) => {
        const result = await next(request)
        return result.data[keypath]
    }
}

function combine(lhs: Middleware, rhs: Middleware): Middleware {
    return (request, next) => {
        return lhs(request, (innerRequest) => {
            return rhs(innerRequest, next)
        })
    }
}

function chain(...middlewares: Middleware[]): Middleware {
    const { length } = middlewares
    let combined = middlewares[length - 1]
    for (let i = length - 2; i >= 0; i--) {
        combined = combine(middlewares[i], combined)
    }
    return combined
}

interface Query<T, U> {
    loading: boolean
    setLoading(loading: boolean): void
    data?: T
    setData(data?: T): void
    error?: U
    setError(error?: U): void
    run(): void
    abort(): void
}

interface ComposedQuery {
    useQuery<T, U>(url: string, params?: any): Query<T, U>
    useQueries;
    useMutation;
    useMutations;
    // data, setData, loading, setLoading, error, setError,
    // willSend, didSend, willReceiveData, didReceiveData,
    // willReceiveError, didReceiveError
    //
}

export function compose(middlewares: Middleware[]): ComposedQuery {
    const middleware = chain(...middlewares)

}


// get useQuery('/users', params)

// post useQuery('/users', multipartdata or json data)
