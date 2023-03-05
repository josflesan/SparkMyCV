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
                                (<PDFViewer>
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
                {/* <PDFViewer className="h-[1000px]">
                    <CVDocument content={
                        [
                            {
                                "type": "h1",
                                "content": "Hello world"
                            },
                            {
                                "type": "p",
                                "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                            },
                            {
                                "type": "bullet",
                                "content": "This is a point\nThis is another point"
                            }
                        ]
                    }/>
                </PDFViewer> */}
            </div>
        </>
    )
}
