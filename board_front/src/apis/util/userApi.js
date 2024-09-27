import { instance } from "./instance";

export const updateProfileImgApi = async (img) => {
    let response = null;
    try {
        response = await instance.patch("/user/img", {img});
    } catch(error) {
        console.error(error);
        response = error.response;
    }
    return response;
}
    