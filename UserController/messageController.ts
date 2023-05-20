import { Request, Response } from "express"
import { pool } from "../db"

export const sendOrCreateMessageConnection = async (req:Request, res:Response) => {
    try {
        console.log(req.body)
        const { owner, notowner, sender, text, time } = req.body
        console.log(owner, notowner)
        const searchForBothUsersQuery = "SELECT * FROM groupie_p_chat WHERE owner = $1 AND notowner = $2"
        const searchForOwnerMessageBox = await pool.query(searchForBothUsersQuery, [owner, notowner])
        const searchForNotOwnerMessageBox = await pool.query(searchForBothUsersQuery, [notowner, owner])
        
        const addToExistingQuery = "UPDATE groupie_p_chat SET message = message || $1 WHERE owner = $2"
        const createNewMessageQuery = "INSERT INTO groupie_p_chat(owner, notowner,notowner_imgurl, message) VALUES($1,$2,$3,$4)"

        const addMessageFunction = async (user1:string, user2:string, addUser:string,  checked1:boolean, checked2:boolean ) => {
            // let = { sender: sender, text: text, checked: false, time: time }
             const addMessage = await  pool.query(addToExistingQuery, [JSON.stringify({ sender: sender, text: text, checked: checked1, time: time }), addUser])
             const createMessageBox = await pool.query(createNewMessageQuery, [user1, user2,"",  JSON.stringify([{ sender: sender, text: text, checked: checked2, time: time }])])   
        }

        // const message = async (checked:boolean) => {
        //     return { sender: sender, text: text, checked: checked, time: time }
        // }
        if (searchForOwnerMessageBox.rows.length === 0 && searchForNotOwnerMessageBox.rows.length === 0) {
            const createOwnerMessageBox = await pool.query(createNewMessageQuery, [owner, notowner,"", JSON.stringify([{ sender: sender, text: text, checked: true, time: time }])]) 
            const createNotOwnerMessageBox = await pool.query(createNewMessageQuery, [notowner, owner,"", JSON.stringify([{ sender: sender, text: text, checked: false, time: time }])])   
        } else if (searchForOwnerMessageBox.rows.length > 0 && searchForNotOwnerMessageBox.rows.length === 0) {
            
            // const addMessage = await pool.query(addToExistingQuery, [JSON.stringify({ sender: sender, text: text, checked: true, time: time }), owner])
            // const createMessageBox = await pool.query(createNewMessageQuery, [notowner, owner,"",  JSON.stringify([{ sender: sender, text: text, checked: false, time: time }])]) 
           addMessageFunction(notowner, owner, owner, true, false)

        } else if (searchForOwnerMessageBox.rows.length === 0 && searchForNotOwnerMessageBox.rows.length > 0) {
            
            // const addMessage = await pool.query(addToExistingQuery, [JSON.stringify({ sender: sender, text: text, checked: true, time: time }), notowner])
            // const createMessageBox = await pool.query(createNewMessageQuery, [owner, notowner,"",  JSON.stringify([{ sender: sender, text: text, checked: false, time: time }])]) 
            addMessageFunction(owner, notowner, notowner,false, true )
            
        } else if (searchForOwnerMessageBox.rows.length > 0  && searchForNotOwnerMessageBox.rows.length > 0  ) {
            const addMessageOwner = await pool.query(addToExistingQuery, [JSON.stringify({ sender: sender, text: text, checked: true, time: time }), owner])
            const addMessageNotForOwner = await pool.query(addToExistingQuery, [JSON.stringify({ sender: sender, text: text, checked: false, time: time }), notowner])
        }
         

    } catch (error:any) {
        console.log(error.message)
    }

}



export const updatechecked = async (req: Request, res: Response) => {
    try {
         const {owner,notowner} = req.body
        const getUserCurrentMeessage = await pool.query("SELECT * FROM groupie_p_chat WHERE owner = $1 AND notowner = $2", [owner, notowner])
        const change = await getUserCurrentMeessage.rows[0].message.map((data: { checked: boolean }) => {
            data.checked = true
        })
    console.log(change, "na me", getUserCurrentMeessage.rows[0].message)
    const updatechecked = await pool.query("UPDATE groupie_p_chat SET message = $1 where owner = $2 AND notowner = $3", [JSON.stringify(getUserCurrentMeessage.rows[0].message), owner, notowner])
     } catch (error:any) {
        console.log(error.message)
        
     }
}

export const deleteMessage = async (req: Request, res: Response) => {
    try {
        const { owner, notOwner } = req.body
        console.log(owner, notOwner, "from message controller")
     const messageBox = await pool.query("DELETE FROM groupie_p_chat WHERE owner = $1 AND notowner = $2", [owner,notOwner])
        
    } catch (error:any) {
        console.log(error.message)
    }
    
}
