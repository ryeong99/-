export const board = async () => {
    let response = null;
    try {
        response = await board.setBoard("/board/write", {});
    } catch(error) {
        console.error(error);
        response = error.response;
    }
    return response;
}