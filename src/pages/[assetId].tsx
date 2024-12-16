import React from "react";
import Router from "next/router";
import { useRouter } from "next/router";

const SingleAssetDetails: React.FC = () => {
    const router = useRouter();
    const assetId = router.query.assetId;
    console.log("this is the id ", assetId)
    return <div>Hello</div>;
};

export default SingleAssetDetails;
