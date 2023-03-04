import { createContext, useCallback, useRef, useState } from 'react'
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

async function calculateSHA256(file: File): Promise<string> {
	const buffer = await file.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	return hashHex;
}

export function useCVs() {
	// setOriginalCV - set the CV PDF to be processed
	// addRequest - adds a request / pending CV to the list
    // removeCV - removes a CV from the list regardless of state
    // setProcessedCV - assigns a processed CV to a pending CV
    // setErrorCV - assigns an error to a pending CV
	const api = useAPI();
	const cvRef = useRef<CVs>({});
	const cvHashRef = useRef<string|null>(null);
	const [cvs, setCvs] = useState<CVs>({});
	const nextIDRef = useRef(0);

	const setOriginalCV = useCallback(async (file: File | null) => {
		if (file) {
			// Get the SHA256 hash of the file
			const hash = await calculateSHA256(file);
			// See if the server has this file already
			const hasFileResponse = await api.checkFileExistsFileFileHashGet(hash);
			console.log(hasFileResponse);
		}
	}, [api]);
	return {
		cvs,
		setOriginalCV
	}
}

export const AppContext = createContext<ReturnType<typeof useCVs>>({} as any);
function AppContextProvider({ children }: { children: React.ReactNode }) {
	const context = useCVs();
	return (
		<AppContext.Provider value={context}>
			{children}
		</AppContext.Provider>
	)
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
	const {setOriginalCV} = useCVs();
	return (
		<APIProvider url='http://localhost:8020'>
			<AppContextProvider>
				<div className='flex flex-col gap-8 w-[800px] m-4'>
					<Upload cvs={cvs}/>
				</div>
			</AppContextProvider>
		</APIProvider>
	)
}

export default App