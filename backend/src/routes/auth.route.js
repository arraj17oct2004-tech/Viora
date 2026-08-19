import express from 'express'
import { login, logout, signup ,onboard } from '../controllers/auth.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/signup',signup)

router.post('/login',login)

router.post('/logout',logout)


router.post('/onboarding',protectRoute,onboard)


// To check if the user is loggedIn or not 
router.get('/me',protectRoute,(req,res)=>{
    return res.status(200).json({success : true,user : req.user});
})



export default router