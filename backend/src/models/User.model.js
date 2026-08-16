import mongoose, { mongo } from "mongoose";
import bcrypt from 'bcryptjs';


const userSchema = new mongoose.Schema({
    fullName :{
        type : String,
        required : true
    },
    email :{
        type : String,
        required : true,
        unique : true
    },
    password :{
        type : String,
        required : true,
        minlength : 6
    },
    bio :{
        type : String,
        default : ""
    },
    profilePic :{
        type : String,
        default : ""
    },
    nativeLanguage : {
        type : String,
        default : ""
    },
    learningLanguage :{
        type : String ,
        default : ""
    } ,
    location : {
        type : String,
        default : "" 
    },
    isOnboarded : {
        type : Boolean,
        default : false
    },
    freinds : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ]

}
,{timestamps : true})


// prehook
userSchema.pre('save',async function (next) {

    if(!this.isModified("password"))return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt);

        next();
    } catch (error) {
        next(error);
    }
})


// Method to match entered password with the hashedPassword stored in DB
userSchema.methods.matchPassword = async function (enteredPassword) {

    const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password );

    return isPasswordCorrect;
};




const User = mongoose.model("User",userSchema);



export default User;





/*
    pre('save') runs this code before saving a user to MongoDB.

    this refers to the current user document.

    this.isModified("password") checks whether the password was changed.

    If the password wasn't changed, return next() skips the hashing.

    This prevents an already-hashed password from being hashed again.

    bcrypt.genSalt(10) generates a random salt.

    bcrypt.hash(this.password, salt) hashes the user's password securely.

    this.password = ... stores the hashed password in the document.

    next() tells Mongoose to continue with the save operation.

    If hashing fails, next(error) passes the error to Mongoose.
*/








