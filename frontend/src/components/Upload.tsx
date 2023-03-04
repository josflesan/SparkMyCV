import { useCallback, useContext, useRef, useState } from "react";
import Dropzone from 'react-dropzone';
import { GrTrash } from "react-icons/gr";
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


function JobURL({url, id, removeUrl}: {url: string, id: number, removeUrl: (id: number) => void}) {
    return <div className="flex flex-row gap-4">
        <div className="flex-grow">{url}</div>
        <button onClick={() => removeUrl(id)}>
            <GrTrash />
        </button>
    </div>
}

function FileUploader() {
    const {setOriginalCV} = useContext(AppContext);
    return <div className="">
        <Dropzone onDrop={(files: File[]) => {
            if (files.length > 0) {
                setOriginalCV(files[0]);
            }
            console.log(files);
        }}>
            {({ getRootProps, getInputProps }) => (
                // Center all content
                <div className="container p-8 cursor-pointer hover-border">
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
            <input ref={urlInputRef} type="text" name="jobURL" className="grow px-2" onChange={(e) => setFilled(e.target.value.length > 0)} placeholder="Paste a URL for a job posting..."/>
            <button className="px-4" disabled={!filled}>+</button>
        </form>
    </div>;
}

function Job({cv}: {cv: ModifiedCVState}) {
    return <div className="flex flex-col gap-4">
        {JSON.stringify(cv)}
    </div>
}

export default function Upload({cvs}: {cvs: CVs}) {
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
                <JobURLPrompt/>
            </div>
        </>
    )
}
