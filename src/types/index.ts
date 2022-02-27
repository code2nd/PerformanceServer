import * as Koa from 'koa'
import * as KoaRouter from '@koa/router'

export type { Context, Next } from 'koa'
export type { Redis } from 'ioredis'

export type App = Koa<Koa.DefaultState, Koa.DefaultContext>
export type Router = KoaRouter

export enum AuthLevel {
  USER = 8,
  ADMIN = 16,
  SUPER_ADMIN = 32
}
