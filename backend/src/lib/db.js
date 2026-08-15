import mongoose from 'mongoose'

export const connectDB = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log('DB-connection SuccessFull...')
    } catch (error) {
        console.error('DB-connection Error :- ',error)
        process.exit(1)
    }
}