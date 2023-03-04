import { useState } from 'react'
import Upload from './components/Upload';
import { Configuration, DefaultApi } from './api';
import { APIProvider } from './APIProvider';

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