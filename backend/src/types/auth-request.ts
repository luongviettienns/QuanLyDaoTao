/** JWT-derived context attached to `req.auth` */
export type AuthRequestContext = {
  userId: bigint
  roleName: string
  username: string
  email: string
}
