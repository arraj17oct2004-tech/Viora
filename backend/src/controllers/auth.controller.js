import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";

export const signup = async (req,res)=>{
   
   const{email , password , fullName} = req.body;

   try {
      // verify the entered values 
      if(!email || !password || !fullName)
         return res.status(400).json({ message : "All Feilds are required .. "});

      if(password.length < 6 )
         return res.status(400).json({message : "Password must be at least 6 characters"});

      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) 
      return res.status(400).json({ message: "Invalid email formate" });
         
      
      const userAlreadyExists = await User.findOne({email});

      if(userAlreadyExists)
      return res.status(400).json({ message : "Email already exists, use unique email"});


      // Generate default avatar
      const avatar = `https://api.dicebear.com/10.x/lorelei/svg?seed=${encodeURIComponent(fullName)}`;

      const newUser = await User.create({
         email,
         fullName,
         password,
         profilePic : avatar,
      })


      // Create the same user in Stream also 
      
     try {
         await upsertStreamUser({
            id : newUser._id.toString(),
            name : newUser.fullName,
            image : newUser.profilePic || ""
         })

         console.log('Stream User created for ',newUser.fullName)

     } 
     catch (error) {
         console.error('Error creating new Stream User (in signUp controller) :- ',error)
     }



      // Generate token 
      const token = jwt.sign({userID : newUser._id},process.env.JWT_SECRET_KEY,
         {expiresIn : "7d"}
      )

      res.cookie("jwt",token,{
         maxAge : 7*24*60*60*1000,
         httpOnly : true, // prevent XSS attack
         sameSite : "strict",
         secure : process.env.NODE_ENV === "production"
      })

      res.status(201).json({success : true ,user : newUser })

   } 
   catch (error) {
      console.log("SignUp Controller Error :- ",error);
      res.status(500).json({message : "Internal Server Error"});
   }

 }



export const login = async (req,res)=>{
   const {email,password} = req.body;

   try {
         if(!email || !password)
         return res.status(400).json({message : "All fields are required"});

      const findUser = await User.findOne({email});

      if(!findUser)
         return res.status(401).json({message : "Invalid email or password"});

      
      // compare enteredPassword with storedPassword => Method is defined in userSchema(User.model.js)
      const isPasswordCorrect = await findUser.matchPassword(password)


      if(!isPasswordCorrect) // isPasswordCorrect === false
         return res.status(401).json({message : "Invalid email or password"});


      const token = jwt.sign({userID : findUser._id},process.env.JWT_SECRET_KEY,
         {expiresIn : "7d"}
      )

      res.cookie("jwt",token,{
            maxAge : 7*24*60*60*1000,
            httpOnly : true, // prevent XSS attack
            sameSite : "strict",
            secure : process.env.NODE_ENV === "production"
      })

      return res.status(200).json({success : true,findUser})

   } 
   catch (error) {
      console.log("Login Controller Error :- ",error);
      res.status(500).json({message : "Internal Server Error"});
   }

}



 export const logout = async (req,res)=>{
    res.clearCookie("jwt")
    return res.status(200).json({success : true,message : "Logout SuccessFull"})
 }




export const onboard = async (req,res)=>{
  try {
      const userId = req.user._id 
      const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

      //  Take all the input fields ,and return all those fields which are empty 
      
      if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName", // (!false && "fullname") -> true
          !bio && "bio", 
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),// 'only 0 wali values return hogi
      });
      }

   
      const updatedUser = await User.findByIdAndUpdate(
         userId,
         {
            ...req.body,
            isOnboarded : true,
         },
         {new : true}
      )

      if (!updatedUser) return res.status(404).json({ message: "User not found" });

      //Update the user data in Stream also
      try {
         await upsertStreamUser({
         id: updatedUser._id.toString(),
         name: updatedUser.fullName,
         image: updatedUser.profilePic || "",
         });
         
         console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
      } 
      catch (streamError) {
         console.log("Error updating Stream user during onboarding:", streamError.message);
      }

      res.status(200).json({ success: true, user: updatedUser });
   
   } 

  catch (error) {
      console.error("Onboarding error:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
} 