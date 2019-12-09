import { call, watchers } from "../../services";

const db = () => {
    return {
        watch(_params) {
            return watchers.send(
                "/moncket/db/watch",
                { collection: _params.collection, args: _params.pipeline },
                _params.success,
                _params.error
            );
        },
        transaction(stacks) {
            return call.http("/moncket/db/transaction", { stacks });
        },
        collection(_collection) {
            const handler = {
                get: function(_stack, name) {
                    let stack = Object.assign([], _stack);
                    return function() {
                        switch (name) {
                            case "exec":
                                return call.http("/moncket/db/collection", { stack });
                            case "stack":
                                return stack;
                            default:
                                stack.push({ name, args: Array.prototype.slice.call(arguments) });
                        }
                        return new Proxy(stack, handler);
                    };
                }
            };
            return new Proxy([{ name: "collection", args: [_collection] }], handler);
        },
        paginate: async _options => {
            let e = await db()
                .collection(_options.collection)
                .aggregate([
                    ..._options.pipeline,
                    {
                        $facet: {
                            docs: [{ $sort: _options.sort }, { $skip: _options.skip }, { $limit: _options.limit }],
                            size: [{ $group: { _id: null, count: { $sum: 1 } } }]
                        }
                    },
                    {
                        $project: {
                            docs: 1,
                            size: { $arrayElemAt: ["$size.count", 0] }
                        }
                    }
                ])
                .toArray()
                .exec();
            return {
                ...e[0],
                size: e[0].size ? e[0].size : 0
            };
        }
    };
};

export default db;
