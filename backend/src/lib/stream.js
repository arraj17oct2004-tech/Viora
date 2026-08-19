import {StreamChat} from 'stream-chat';
import 'dotenv/config'

const apiKey = process.env.STREAM_API_KEY
const apiSecret = process.env.STREAM_API_SECRET

if(!apiKey || !apiSecret)
    console.error("Stream Api-key or Api-secret is missing..")

const streamClient = StreamChat.getInstance(apiKey,apiSecret);


export const upsertStreamUser = async (My_userData) => {
    try {
        await streamClient.upsertUser(My_userData)
        // My_userData is the information about the user you want to put into Stream.
        return My_userData    
    } 
    catch (error) {
        console.error('Error Upserting Stream User :- ',error)
    }
} 
/*   FLOWCHART of aboveMethod 



        User registers
            ↓
        Create user in MongoDB
            ↓
        Create/update same user in Stream
            ↓
        User can use Stream Chat
*/


//will do it later 
export const generateStreamToken = (userId) => {}
