import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { createTask, updateTask } from "@/services/toDoServices";
import { TaskTypes } from "@/types/todoTypes";
import { TaskInputTypes } from "@/types/todoTypes";

const TaskInputForm: React.FC<TaskInputTypes> = ({
  handleDialogCreate,
  handleDialogEdit,
  selectedTask,
}) => {
  const [theSelectedTask, setTheSelectedTask] = useState<TaskTypes | null>();
  const [date, setDate] = React.useState<Date | undefined>(() => {
    const savedDueDate = localStorage.getItem("consistent-dueDate");
    return savedDueDate ? new Date(savedDueDate) : undefined;
  });

  const [newTask, setNewTask] = useState<TaskTypes>(() => {
    const savednewTask = localStorage.getItem("consistent-task");
    return savednewTask
      ? JSON.parse(savednewTask)
      : {
          _id: "",
          title: "",
          description: "",
          priority: "",
          category: "",
          dueDate: "",
          createdDate: "",
        };
  });

  useEffect(() => {
    localStorage.setItem("consistent-task", JSON.stringify(newTask));
  }, [newTask]);

  useEffect(() => {
    if (selectedTask) setTheSelectedTask(selectedTask);
  }, [selectedTask]);

  useEffect(() => {
    if (theSelectedTask) {
      console.log("theSelectedTask", theSelectedTask);
      setNewTask(theSelectedTask);
    }
  }, [theSelectedTask]);

  useEffect(() => {
    console.log("yawa na duedate", date);
    if (date) {
      console.log("Updated dueDate:", date);
      localStorage.setItem("consistent-dueDate", date.toISOString());
      setNewTask((prevTask) => ({
        ...prevTask,
        dueDate: date,
      }));
    }
  }, [date]);

  const handleDialogEditTaskfunc = async () => {
    console.log("clicked save task", handleDialogEdit);

    try {
      const response = await updateTask(newTask);
      localStorage.removeItem("consistent-task");
      localStorage.removeItem("consistent-dueDate");
      return response ? response : null;
    } catch (error: any) {
      console.error(error.message);
    } finally {
      handleDialogEdit && handleDialogEdit();
    }
  };

  const handleDialogCreateTaskfunc = async () => {
    console.log("newtask in handle create", newTask);

    // const isValid = Object.values(newTask).every(value => value !== '' && value !== null && value !== undefined);

    // if(!isValid){
    //   console.log("input all fields");
    //   return;
    // }

    try {
      const response = await createTask(newTask);
      response && console.log("created: ", response);

      handleDialogCreate && handleDialogCreate();
      localStorage.removeItem("consistent-dueDate");
      localStorage.removeItem("consistent-task");
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleValueChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value, name } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="">
      <form>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Name of task"
              value={newTask.title}
              name="title"
              onChange={handleValueChange}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Description of task"
              value={newTask.description}
              name="description"
              onChange={handleValueChange}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="due">Due date</Label>
            <Popover>
              <PopoverTrigger asChild id="due">
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, "PPP")
                  ) : theSelectedTask?.dueDate ? (
                    format(theSelectedTask?.dueDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50">
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={newTask.priority}
              onValueChange={(value) =>
                setNewTask({
                  ...newTask,
                  priority: value as "low" | "medium" | "high",
                })
              }
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={
              handleDialogCreate
                ? handleDialogCreateTaskfunc
                : handleDialogEditTaskfunc
            }
          >
            Save task
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskInputForm;
