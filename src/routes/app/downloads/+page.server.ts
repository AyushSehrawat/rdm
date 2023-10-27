import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
    const getAllDownloads = async () => {
        let res = await fetch('/api/app/downloads?type=all')
        let data = await res.json()
        return data
    }

    return {
        allDownloads: getAllDownloads()
    }
}