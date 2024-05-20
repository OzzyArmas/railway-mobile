export type MinServiceInfo = {
    serviceIcon: string | null | undefined,
    serviceID: string | null | undefined,
    deleted: boolean,
    status: String | null | undefined,
    source: {
      image: string | null | undefined,
      repo: string | null | undefined
    },
}