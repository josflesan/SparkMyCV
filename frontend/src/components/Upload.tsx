import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Dropzone from 'react-dropzone';
import { GrEdit, GrInspect, GrTrash } from "react-icons/gr";
import { BiErrorAlt } from "react-icons/bi";
import { GrInProgress, GrDownload } from "react-icons/gr";
import { AiOutlineCheck } from "react-icons/ai";
import { useAPI } from "../APIProvider";
import { AppContext, CVs, ModifiedCV, ModifiedCVState } from "../App";
import { PDFDownloadLink, PDFViewer, usePDF } from "@react-pdf/renderer";
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

function FileUploader() {
    const { setOriginalCV, originalCV, reset } = useContext(AppContext);
    return <div className="container cursor-pointer hover-border rounded-xl">
        {
            originalCV ? (
                <div className="p-8" onClick={() => {
                    reset()
                    setOriginalCV(null)
                }}>
                    CV uploaded. Please add job postings, or click here to reset.
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
                            <div>
                                <div
                                    {...getRootProps({
                                        className: 'dropzone',
                                        onDrop: event => event.stopPropagation()
                                    })} className="p-8"
                                >
                                    <input {...getInputProps()} />
                                    <p>Click to upload your resume 👆</p>
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
        <form className="w-full overflow-clip flex flex-row hover-border rounded-xl">
            <input ref={urlInputRef} type="text" name="jobURL" className="grow px-2" onChange={(e) => setFilled(e.target.value.length > 0)} placeholder="Paste a URL for a job posting..." />
            <button className="px-4" disabled={!filled}>+</button>
        </form>
    </div>;
}

function Job({ cv, id }: { cv: ModifiedCVState, id: string }) {
    console.log(typeof id)
    const { deleteCV } = useContext(AppContext)
    const [showInspect, setShowInspect] = useState(false);
    return (
        <div>
            <div className="flex flex-row gap-4">
                <div className="flex-grow">
                    {
                        cv.processedState === "processing" ? (
                            <div className="px-2">
                                <ProcessingText url={cv.url} />
                            </div>
                        ) : (
                            cv.processedState === "error" ? (
                                <div className="px-2 text-red-700">
                                    <BiErrorAlt className="inline translate-y-[-1.5px]" />
                                    <div className="inline ml-2">
                                        {`Internal error occured, please try again.`}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="px-2">
                                        <div>
                                            <div className="inline font-bold">
                                                {`${cv.results?.jobTitle}, `}
                                            </div>
                                            <div className="inline">
                                                {cv.results?.company}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )
                        )
                    }
                </div>
                {
                    cv.results === null ? null : (
                        <>
                            <GrInspect className="cursor-pointer" onClick={()=>{
                                setShowInspect((x)=>(!x))
                            }}></GrInspect>
                            <DownloadIcon content={cv.results} />
                        </>
                    )
                }
                <GrTrash className="cursor-pointer" onClick={() => {
                    deleteCV(id)
                }} />
            </div>
            {
                ((cv.results !== null) && showInspect) ? (
                    <div className="p-2">
                        {
                            cv.results.edits.map((edit, index) => (
                                <div key={index} className="flex flex-row">
                                    <div className="pr-4">•</div>
                                    <div>
                                    {edit}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                ) : null
            }
            {/* {(cv.results !== null) ?
                (<PDFViewer className="h-[1000px]">
                    <CVDocument content={cv.results?.modifiedCV} />
                </PDFViewer>) : null} */}
        </div>
    )
}


const processingText = [
    "Processing file",
    "Gnomes busy working",
    "Preparing parchment",
    "Summoning resume wizardry",
    "Organizing skills like a boss",
    "Conjuring up the perfect CV",
    "Fluffing up achievements",
    "Polishing work experience",
    "Creating a masterpiece of self-promotion",
    "Whipping up a CV souffle",
    "Making sure all the Ts are crossed and Is are dotted",
    "Building a CV that'll make your mom proud",
    "Compiling career highlights like a pro",
    "Assembling a CV like a puzzle",
    "Shuffling through job history",
    "Crafting a work of art on paper",
    "Turning work experience into gold",
    "Mixing and matching accomplishments",
    "Brainstorming the perfect CV headline",
    "Mapping out your career path (on paper)",
    "Pouring your heart and soul into your CV",
    "Unleashing the power of Microsoft Word",
    "Crafting a CV masterpiece that would make Da Vinci proud",
    "Polishing up your professional brand",
    "Putting the 'pro' in 'professional'",
    "Putting the 'wow' in 'resume'",
    "Building a better CV, one line at a time",
    "Crunching the numbers (of your achievements)",
    "Organizing your life (on paper)",
    "Making your CV shine like a diamond",
    "Sprinkling some magic on your CV",
    "Turning job experience into a work of art",
    "Creating a CV that's irresistible to employers",
    "Revving up your job search engine",
    "Unleashing your inner wordsmith",
    "Reinventing the way you sell yourself",
    "Building a CV that tells your story",
    "Making your CV a page-turner",
    "Turning your CV into a masterpiece of persuasion",
    "Transforming your career history into a work of genius",
    "Creating a CV that screams 'Hire Me!'",
    "Putting the 'win' in 'winning CV'",
    "Turning your job search into a success story",
    "Crafting a CV that's as unique as you are",
    "Making your CV sparkle and shine",
    "Building a bridge between you and your dream job",
    "Creating a CV that'll knock their socks off",
    "Transforming your work experience into a work of art",
    "Polishing up your professional story",
    "Making your CV a true reflection of your awesomeness",
    "Revving up your CV engine",
    "Putting the 'pro' in 'productivity'",
    "Creating a CV that'll make recruiters drool",
    "Building a CV that's impossible to ignore",
    "Turning your job search into a work of passion",
    "Crafting a CV that's worth its weight in gold",
    "Putting the 'magic' in 'career magic'",
    "Creating a CV that's a cut above the rest",
    "Transforming your CV into a work of genius",
    "Putting the 'resume' in 'resume genius'",
    "Building a CV that's a work of art",
    "Taking your CV to the next level (and beyond!)",
    "Polishing up your career highlights",
    "Creating a CV that's simply irresistible",
    "Making your CV a force to be reckoned with",
    "Crafting a CV that's sure to impress",
    "Putting the 'pro' in 'professionalism'",
    "Building a CV that's bulletproof",
    "Turning your job history into a masterpiece",
    "Creating a CV that's as impressive as you are",
    "Transforming your CV into a work of wonder",
    "Polishing up your professional profile",
    "Making your CV stand out from the crowd"
]

const ellipsis = [".", "..", "..."]

function AnimatedEllipsis() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setIndex((index) => (index + 1) % ellipsis.length);
        }, 500);

        return () => clearInterval(intervalId);
    }, []);

    return <span>{ellipsis[index]}</span>;
}

function ProcessingText({ url }: { url: string }) {
    const [loadingIndex, setLoadingIndex] = useState<number>(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setLoadingIndex(() => Math.floor(Math.random() * processingText.length))
        }, 5000)
    }, [])
    return (
        <div className="inline">
            <div className="flex flex-row flex-nowrap">
                <div className="inline">
                    <div className="overflow-hidden whitespace-nowrap text-ellipsis w-64">
                        <GrInProgress className="inline mr-2 translate-y-[-1.5px]" />
                        {`${url}`}
                    </div>
                </div>

                <div className="inline">
                    <span>
                        {processingText[loadingIndex]}
                    </span>
                    <AnimatedEllipsis />
                </div>
            </div>
        </div>

    )
}

function DownloadIcon({ content }: { content: ModifiedCV }) {
    // const [instance, updateInstance] = usePDF({ document: <CVDocument content={content.modifiedCV}/> });
    return (
        <PDFDownloadLink document={<CVDocument content={content.modifiedCV} />} fileName={(`${content.company}-${content.jobTitle}`).replace(" ", "_")}>
            {({ blob, url, loading, error }) =>
                loading ? null : <GrDownload className="" />
            }
        </PDFDownloadLink>
    )
}

export default function Upload() {
    const { cvs } = useContext(AppContext);
    return (
        <>
            <h1 className='text-6xl font-serif font-[700] text-bold'>
                ✨ your CV.
            </h1>
            <div>
                Upload your CV and job posting URLs, and we'll ✨ your CV to match each job posting.
            </div>
            <div className="flex flex-col gap-4">
                <FileUploader />
                <div className="flex flex-col gap-4">
                    {
                        Object.entries(cvs).map(([id, cv]) => <Job key={id} id={id} cv={cv} />)
                    }
                </div>
                <JobURLPrompt />
            </div>
        </>
    )
}
