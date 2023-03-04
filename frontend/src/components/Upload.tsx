import { useCallback, useRef, useState } from "react";
import { CVResults } from "./Result";
import Dropzone from 'react-dropzone';
import { GrTrash } from "react-icons/gr";

function useURLList() {
    const [urls, setUrls] = useState<{ [key: string]: string; }>({});
    const curIDRef = useRef(0);
    const addUrl = useCallback((url: string) => {
        setUrls(prev => ({ ...prev, [curIDRef.current++]: url }));
    }, [setUrls]);
    const removeUrl = useCallback((id: number) => {
        setUrls(prev => {
            const newUrls = { ...prev };
            delete newUrls[id];
            return newUrls;
        });
    }, [setUrls]);
    return { urls, addUrl, removeUrl };
}


function JobURL({url, id, removeUrl}: {url: string, id: number, removeUrl: (id: number) => void}) {
    return <div className="flex flex-row gap-4">
        <div className="flex-grow">{url}</div>
        <button onClick={() => removeUrl(id)}>
            <GrTrash />
        </button>
    </div>
}

function FileUploader() {
    return <div className="">
        <Dropzone onDrop={(files: File[]) => console.log(files)}>
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

function JobURLPrompt({ addUrl }: {addUrl: (url: string) => void}) {
    const [filled, setFilled] = useState(false);
    const urlInputRef = useRef<HTMLInputElement>(null);
    return <div className="flex flex-col gap-4 w-full" onSubmit={(e) => {
        e.preventDefault()
        if (urlInputRef.current) {
            addUrl(urlInputRef.current.value);
            urlInputRef.current.value = "";
        }
    }}>
        <form className="w-full overflow-clip flex flex-row hover-border">
            <input ref={urlInputRef} type="text" name="jobURL" className="grow px-2" onChange={(e) => setFilled(e.target.value.length > 0)} placeholder="Paste a URL for a job posting..."/>
            <button className="px-4" disabled={!filled}>+</button>
        </form>
    </div>;
}

export default function Upload({ setResults }: { setResults: (results: CVResults) => void }) {
    const { urls, addUrl, removeUrl } = useURLList();
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
                {
                    Object.entries(urls).map(([id, url]) => <JobURL key={id} id={parseInt(id)} url={url} removeUrl={removeUrl}/>)
                }
                <JobURLPrompt addUrl={addUrl}/>
            </div>
        </>
    )
}
