import { globals } from "../";

export default () => {
    const generator = () =>
        Math.random()
            .toString()
            .substring(2, 15);
    return `${globals.get("socket").id}.${new Date().getTime()}.${generator()}.${generator()}.${generator()}`;
};
