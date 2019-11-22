export default {
    ObjectId: ($mObjectId) => ({ $mObjectId }),
    Date: ($mDate) => ({ $mDate }),
    Double: ($mDouble) => ({ $mDouble }),
    Int32: ($mInt32) => ({ $mInt32 }),
    Long: ($mLong) => ({ $mLong }),
    Timestamp: ($mTimestamp) => ({ $mTimestamp }),
    ServerDatetime: () => ({ $mServerDatetime: 1 }),
    ServerTimestamp: () => ({ $mServerTimestamp: 1 }),
    Md5: ($mMd5) => ({ $mMd5 })
};