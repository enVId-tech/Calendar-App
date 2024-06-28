import UserData from "./interfaces";

async function getUserData(dataId: string): Promise<UserData | null | undefined> {
    try {

        console.log(dataId)
        const dataJson: object = {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({
                "userId": dataId
            })
        }
        const response: Response = await fetch('/api/post/user', dataJson);

        const result: UserData | null | undefined = await response.json();

        return result;
    } catch (error: unknown) {
        console.error('Error:', error);
    }

    return
}

export default getUserData;