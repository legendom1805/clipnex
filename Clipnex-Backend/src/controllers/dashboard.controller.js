import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
   

    const info = await Video.aggregate([
        {
            $match:{owner:req.user._id}
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"liked"
            }
        },
        {
            $addFields:{
                likes:{
                $size:"$liked"
                },
                owner:req.user.userName,
            },
        },
        {
            $group:{
                _id:null,
                totalLikesCount:{
                    $sum:"$likes"
                },
                totalViewsCount:{
                    $sum:"$views"
                }
            }
        }
    ])

    const subscribers = await Subscription.aggregate([
       {
            $match:{channel:req.user._id}
       },
       {
            $group:{
                _id:null,
                subscribers:{
                    $sum:1
                }
            }
       }
    ])

    if(!subscribers || !info){
        throw new apiError(500,"Failed to fetch details")
    }

    const response = {
        subscribers:subscribers[0]?.subscribers || 0,
        likes:info[0]?.totalLikesCount || 0,
        views:info[0]?.totalViewsCount || 0
    }

    return res
    .status(200)
    .json(new apiResponse(200,response,"User's channel details fetched successfully"))
})

const getChannelVideosGlobal = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const {channelName} = req.params

    if(!channelName){
        throw new apiError(404,"Provide channel name")
    }

    const user = await User.findOne({username : channelName})

    if(!user){
        throw new apiError(404,"Channel not found")
    }

    const videos = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(user._id),
                isPublished:true
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"liked"
            }
        },
        {
            $addFields:{
                owner:user.username,
                likes:{
                    $size:"$liked"
                }
            }
        },
    ])
   
    if(videos.length === 0){
        throw new apiError(404,"This user have not uploaded any videos yet")
    }

    return res
    .status(200)
    .json(new apiResponse(200,videos,"Videos of the provided channel is fetched successfully"))

})


const getChannelVideosOur = asyncHandler(async(req,res)=>{
        //fetch our total uploaded videos

        const videos = await Video.aggregate([
            {
                $match:{owner:req.user?._id}
            },
            {
                $lookup:{
                    from:"likes",
                    localField:"_id",
                    foreignField:"video",
                    as:"liked"
                }
            },
            {
                $addFields:{
                    likes:{
                        $size:"$liked"
                    },
                    owner:req.user.username
                }
            }
        ])

        return res
        .status(200)
        .json(new apiResponse(200,videos,"Your channels videos found successfully"))
})


export {
    getChannelStats, 
    getChannelVideosGlobal,
    getChannelVideosOur
    }