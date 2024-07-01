function getCookie(name: string) {
    const cookie: string = document.cookie;
    const cookieArray: string[] = cookie.split(";");
    let cookieValue: string = "";
    cookieArray.forEach((element: string) => {
        if (element.includes(name)) {
            cookieValue = element.split("=")[1];
        }
    });
    return cookieValue;
}

export default getCookie;