import fs from 'fs'
import { Solver, SuccessErrorCallback } from 'successerror'

export function rm(path: string) { return remove(path) }
export function unlink(path: string) { return remove(path) }
export function remove(path: string, ...callbacks: SuccessErrorCallback[]) {
    fs.unlink(path, Solver.with(callbacks).solve)
}

export function write(path: string, obj: any, ...callbacks: SuccessErrorCallback[]) { return save(path, obj, ...callbacks) }
export function save(path: string, obj: any, ...callbacks: SuccessErrorCallback[]) {
    const solver = Solver.with(callbacks)

    try {
        if (path.endsWith('.json')) obj = JSON.stringify(obj)

        fs.writeFile(path, obj, solver.solve)
    } catch(err) {
        solver.solve(err)
    }
}

export function read<T>(
    path: string,
    fallbackValue: T = null,
    saveIfNotExists: boolean = false,
    callback: (err: NodeJS.ErrnoException | null, data: T | string) => void
) {
    load(path, fallbackValue, saveIfNotExists, callback)
}
export function load<T>(
    path: string,
    fallbackValue: T = null,
    saveIfNotExists: boolean = false,
    callback: (err: NodeJS.ErrnoException | null, data: T | string) => void
) {
    exists(path, (exists => {
        if (!exists) {
            if(fallbackValue) {
                if (saveIfNotExists) {
                    save(path, fallbackValue, () => { callback(null, fallbackValue) }, (err => { callback(err, fallbackValue) }))
                }
            }

            return
        }

        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                callback(err, null)
            }

            if (path.endsWith('.json')) {
                try {
                    data = JSON.parse(data)
                } catch (err) { callback(err, data) }

                callback(null, data)
            }
        })
    }))
}

export function exists(path: string, callback: (exists: boolean) => void) { fs.exists(path, callback) }

export function cp(src: string, dest: string, ...callbacks: SuccessErrorCallback[]) { return copy(src, dest, ...callbacks) }
export function copy(src: string, dest: string, ...callbacks: SuccessErrorCallback[]) {
    fs.copyFile(src, dest, Solver.with(callbacks).solve)
}

export function mv(src: string, dest: string, ...callbacks: SuccessErrorCallback[]) { return move(src, dest, ...callbacks) }
export function move(src: string, dest: string, ...callbacks: SuccessErrorCallback[]) {
    fs.rename(src, dest, Solver.with(callbacks).solve)
}

export function mkdir(path: string, recursive = true, ...callbacks: SuccessErrorCallback[]) {
    fs.mkdir(path, { recursive: recursive }, Solver.with(callbacks).solve)
}

export function touch(path: string, ...callbacks: SuccessErrorCallback[]) {
    return save(path, null, ...callbacks)
}