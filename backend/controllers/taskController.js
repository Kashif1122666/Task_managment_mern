import taskModel from "../model/taskModel.js";

// Create a new task

export const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate ,completed} = req.body;
        const task = new taskModel({
            title,
            description,
            priority,
            dueDate,
            completed: completed === 'yes' || completed === true,
            owner: req.user._id,
        });
       const saved = await task.save();
        res.status(201).json({ success: true, task: saved});
    } catch (error) {
        res.status(400).json({success:false, message:error.message})
        
    }
}

// get all task for logged in user
export const getTasks = async (req,res) =>{
    try {
        const tasks = await taskModel.find({owner: req.user.id}).sort({createdAt:-1});
        res.json({success:true,tasks})
    } catch (error) {
        res.status(500).json({success:false, message:error.message})
    }
} 

// get single task by id must belong to that specific user 

export const getTaskById = async () =>{
    try {
        const task = await taskModel.findOne({_id:req.params.id , owner : req.user.id});
        if(!task) return res.status(404).json({
            success:false,
            message:"Task not found"
        });
        res.json({success:true,task})
    } catch (error) {
        res.status(500).json({success:false, message:error.message})
        
    }
}

// update task 

export const updateTask = async (req,res) =>{
    try {
        const data = {...req.body};
        if(data.completed !== undefined){
               data.completed = data.completed === 'yes' || data.completed === true;
            }

    const updated = await taskModel.findOneAndUpdate(
        {_id:req.params.id , owner: req.user.id},
        data,
        {new:true,runValidators:true}
    );
    if (!updated) return res.status(404).json({
        success:false,message:"Task not found or not Yours"
    })
    res.json({success:true,task:updated})
} catch (error) {
    res.status(400).json({success:false, message:error.message})
    
}

}

// delete task  

export const deleteTask = async (req,res)=>{
    try {
        const deleted = await taskModel.findOneAndDelete({_id:req.params.id ,owner : req.user.id});
        if (!deleted) return res.status(404).json({success:false , message:"task not found or not Yours"})
            res.json({success:true,message:"Task deleted"})
    } catch (error) {
        res.status(500).json({success:false, message:error.message})
        
   }
}