import { useCallback, useRef, useState } from 'react'
import Upload from './components/Upload';
import { Configuration, DefaultApi } from './api';
import { APIProvider, useAPI } from './APIProvider';

export type ModifiedCV = {
    company: string,
    jobTitle: string,
    modifiedCV: string
}

export type ModifiedCVState = {
    url: string,
    processedState: "processing" | "processed" | "error",
    results: ModifiedCV | null,
    error: string | null
}

export type CVs = {
	[id: number]: ModifiedCVState
}

export function useCVs() {
	// setOriginalCV - set the CV PDF to be processed
	// addRequest - adds a request / pending CV to the list
    // removeCV - removes a CV from the list regardless of state
    // setProcessedCV - assigns a processed CV to a pending CV
    // setErrorCV - assigns an error to a pending CV
	const api = useAPI();
	const cvRef = useRef<CVs>({});
	const [cvs, setCvs] = useState<CVs>({});
	const nextIDRef = useRef(0);

	const setOriginalCV = useCallback((file: File | null) => {
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				if (e.target) {
					const data = e.target.result;
					if (data) {
						// api.uploadCV(data as string).then((response) => {
						// 	console.log(response);
						// });
					}
				}
			}
			reader.readAsDataURL(file);
		}
	}, [api]);

}

function App() {
	const [cvs, setCvs] = useState<CVs>({
		1: {
			url: "https://www.linkedin.com/in/alexander-lee-1b1b3b1b3/",
			processedState: "processing",
			results: null,
			error: null
		},
		2: {
			url: "https://www.linkedin.com/in/alexander-lee-1b1b3b1b3/",
			processedState: "processed",
			results: {
				company: "Google",
				jobTitle: "Software Engineer",
				modifiedCV: "some cv"
			},
			error: null
		},
		3: {
			url: "https://www.linkedin.com/in/alexander-lee-1b1b3b1b3/",
			processedState: "error",
			results: null,
			error: "some error"
		}
	});
	return (
		<APIProvider url='http://localhost:8080'>
			<div className='flex flex-col gap-8 w-[800px] m-4'>
				<Upload cvs={cvs}/>
			</div>
		</APIProvider>
	)
}

export default App