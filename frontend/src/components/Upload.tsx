import { useCallback, useContext, useRef, useState } from "react";
import Dropzone from 'react-dropzone';
import { GrTrash } from "react-icons/gr";
import { BiErrorAlt } from "react-icons/bi";
import { GrInProgress } from "react-icons/gr";
import { AiOutlineCheck } from "react-icons/ai";
import { useAPI } from "../APIProvider";
import { AppContext, CVs, ModifiedCVState } from "../App";

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
    return <div className="flex flex-col gap-4 w-full" onSubmit={(e) => {
        e.preventDefault()
        if (urlInputRef.current) {
            // addUrl(urlInputRef.current.value);
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
    if (cv.processedState === "processing") {
        return <div className="px-2">
            <GrInProgress className="inline"/>
            {" " + cv.processedState.charAt(0).toUpperCase() + cv.processedState.slice(1)}
        </div>
    }
    else if (cv.processedState === "error") {
        return <div className="px-2 text-red-700">
            <BiErrorAlt className="inline"/>
            {" " + cv.processedState.charAt(0).toUpperCase() + cv.processedState.slice(1)}
        </div>
    }
    else {
        return <div className="px-2 inline text-green-700">
            <AiOutlineCheck className="inline"/>
            {" Job position: " + cv.results?.company}
        </div>
    }
}

export default function Upload({ cvs }: { cvs: CVs }) {
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
            </div>
        </>
    )
}
