import { useCallback, useContext, useRef, useState } from "react";
import Dropzone from 'react-dropzone';
import { GrTrash } from "react-icons/gr";
import { BiErrorAlt } from "react-icons/bi";
import { GrInProgress } from "react-icons/gr";
import { AiOutlineCheck } from "react-icons/ai";
import { useAPI } from "../APIProvider";
import { AppContext, CVs, ModifiedCVState } from "../App";
import { PDFViewer } from "@react-pdf/renderer";
import { CVDocument } from "./renderer/CVRenderer";

// function useCVList() {
//     // addRequest - adds a request / pending CV to the list
//     // removeCV - removes a CV from the list regardless of state
//     // setProcessedCV - assigns a processed CV to a pending CV
//     // setErrorCV - assigns an error to a pending CV
//     const [cvs, setCvs] = useState<{[id: number]: ModifiedCVState}>({});
//     const nextId = useRef(0);
//     // addRequest
//     const addRequest = useCallback((url: string) => {
//         setCvs((cvs: {[id: number]: ModifiedCVState}) => {
//             return {}
//         }
//     }, [setCvs]);
//     }
// }


function JobURL({ url, id, removeUrl }: { url: string, id: number, removeUrl: (id: number) => void }) {
    return <div className="flex flex-row gap-4">
        <div className="flex-grow">{url}</div>
        <button onClick={() => removeUrl(id)}>
            <GrTrash />
        </button>
    </div>
}

function FileUploader() {
    const {setOriginalCV, originalCV} = useContext(AppContext);
    return <div className="container p-8 cursor-pointer hover-border">
        {
            originalCV ? (
                <div onClick={()=>{
                    console.log("Clicked");
                    setOriginalCV(null);
                }}>
                    CV uploaded. Click to change.
                </div>
            ) :
            (
                <Dropzone onDrop={(files: File[]) => {
                    if (files.length > 0) {
                        setOriginalCV(files[0]);
                    }
                    console.log(files);
                }}>
                    {({ getRootProps, getInputProps }) => (
                        // Center all content
                        <div className="">
                            <div
                                {...getRootProps({
                                    className: 'dropzone',
                                    onDrop: event => event.stopPropagation()
                                })}
                            >
                                <input {...getInputProps()} />
                                <p>Drop your CV here ↓</p>
                            </div>
                        </div>
                    )}
                </Dropzone>
            )
        }
    </div>;
}

function JobURLPrompt() {
    const [filled, setFilled] = useState(false);
    const urlInputRef = useRef<HTMLInputElement>(null);
    const { addRequest } = useContext(AppContext);
    return <div className="flex flex-col gap-4 w-full" onSubmit={(e) => {
        e.preventDefault()
        if (urlInputRef.current) {
            // addUrl(urlInputRef.current.value);
            addRequest(urlInputRef.current.value);
            urlInputRef.current.value = "";
        }
    }}>
        <form className="w-full overflow-clip flex flex-row hover-border">
            <input ref={urlInputRef} type="text" name="jobURL" className="grow px-2" onChange={(e) => setFilled(e.target.value.length > 0)} placeholder="Paste a URL for a job posting..." />
            <button className="px-4" disabled={!filled}>+</button>
        </form>
    </div>;
}

function Job({ cv }: { cv: ModifiedCVState }) {
    return (
        <div className="flex flex-row gap-4">
            <div className="flex-grow">
                {
                    cv.processedState === "processing" ? (
                        <div className="px-2">
                            <GrInProgress className="inline"/>
                            {" " + cv.processedState.charAt(0).toUpperCase() + cv.processedState.slice(1)}
                        </div>
                    ) : (
                        cv.processedState === "error" ? (
                            <div className="px-2 text-red-700">
                                <BiErrorAlt className="inline"/>
                                {" " + cv.processedState.charAt(0).toUpperCase() + cv.processedState.slice(1)}
                            </div>
                        ) : (
                            <>
                                <div className="px-2 inline text-green-700">
                                    <AiOutlineCheck className="inline"/>
                                    {" Job position: " + cv.results?.company}
                                </div>
                                {(cv.results !== null) ?
                                (<PDFViewer className="h-[1000px]">
                                    <CVDocument content={cv.results?.modifiedCV}/>
                                </PDFViewer>) : null}
                            </>
                        )
                    )
                }
            </div>
            <button onClick={() => {
                console.log("Clicked");
            }}>
                <GrTrash />
            </button>
        </div>
    )
}

export default function Upload() {
    const {cvs} = useContext(AppContext);
    return (
        <>
            <h1 className='text-6xl font-serif font-[700] text-bold'>
                Pimp your CV.
            </h1>
            <div>
                Upload your CV and job posting URLs, and we'll rewrite your CV to match each job posting.
            </div>
            <div className="flex flex-col gap-4">
                <FileUploader />
                <div className="flex flex-col gap-4">
                    {
                        Object.entries(cvs).map(([id, cv]) => <Job key={id} cv={cv} />)
                    }
                </div>
                <JobURLPrompt />
                <PDFViewer className="h-[1000px]">
                    <CVDocument content={
                        JSON.parse(
                            "[    {        \"type\": \"h1\",        \"content\": \"Computer Science Student Anish Thapa Profile\"    },    {        \"type\": \"div\",        \"content\": \"A highly motivated and passionate Computer Science student,\\n demonstrating determination and excellent organization skills. A proven problem-solver, I have made code optimizations resulting in 25% memory usage reduction. Experienced in software engineering, interning at Doodle Learning, and participating in the Edinburgh University Formula Student (EUFS), I strive to develop my skillset.\"    },    {        \"type\": \"h2\",        \"content\": \"Experience\"    },    {        \"type\": \"div\",        \"content\": \"Software Engineer Intern, Doodle Learning; Bath, UK — May 2022 – September 2022: Invited to re-intern and became the most appreciated employee on 15Five. Worked on test engineering (Robot Framework) and new App features, such as Remote Config implementation. Experienced a company acquisition, as Discovery Education acquired the firm in my last month of internship.\"    },    {        \"type\": \"div\",        \"content\": \"Software Infrastructure Engineer, EUFS; Edinburgh, UK — October 2021 – May 2022: Worked in the infrastructure team, developing coding skills in ROS (Python and C++) and using Gazebo for making accurate car simulations. Contributed to upgrading the bicycle model to a four wheel model, resulting in more accurate car simulations and a win in the simulation category.\"    },    {        \"type\": \"div\",        \"content\": \"Software Engineer Intern, Doodle Learning; Bath, UK — May 2021 – September 2021: Gained proficiency in C#, debugging code, and implementing new features. Demonstrated team working skills by participating in code reviews and pair programming. Completed time-critical tasks before the next version release by fixing critical bugs. Reduced overall memory usage by 25% through making code optimizations.\"    },    {        \"type\": \"h2\",        \"content\": \"Projects\"    },    {        \"type\": \"bullet\",        \"content\": \"Turn-based Strategy Game (Python, PyGame) – created a game involving four players, four different unit types and balancing for an enjoyable experience. Sudoku Solver (Python) – developed a solver that transforms a 2D representation of the board into a solved 2D list, with a GUI version to show the backtracking process. Tic-Tac-Toe AI (Python) – created an AI that returns the best possible move, given a 2D representation of a tic-tac-toe board, and allowing for the option to play against the AI.\"    },    {        \"type\": \"h2\",        \"content\": \"Education\"    },    {        \"type\": \"div\",        \"content\": \"Kingswood School, Bath, UK — A Level Maths, F.Maths, CS, Physics 2018-2020 (A*, A, A, A). University of Edinburgh, Edinburgh, UK — BSc Computer Science 2020-2024 (Average First Year 1 & 2).\"    },    {        \"type\": \"h2\",        \"content\": \"Skills Relevant to Job Posting\"    },    {        \"type\": \"bullet\",        \"content\": \"JavaScript, Node.js, React & Unity – two 5-month internships with Doodle Learning. C++ and ROS – used in working as a Software Engineer for Formula Student. Python – started learning since 2013 and further developed in A Levels and university modules. Java, C and Haskell – learned through university modules. Jira & Git – used extensively during the internship and while working as a Software Engineer at Formula Student.\"    },    {        \"type\": \"div\",        \"content\": \"New Road, Stoke Gifford, Bristol | 07869 405140 | anishsarum@gmail.com\"    }]"
                        )
                    }/>
                </PDFViewer>
            </div>
        </>
    )
}
