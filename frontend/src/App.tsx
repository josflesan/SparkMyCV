import { createContext, useCallback, useRef, useState } from 'react'
import Upload from './components/Upload';
import { Configuration, DefaultApi } from './api';
import { APIProvider, useAPI } from './APIProvider';
import { RawCVComponentObject, RawCVObject } from './components/renderer/CVRenderer';
import { z } from 'zod';

export type ModifiedCV = {
    company: string,
    jobTitle: string,
    modifiedCV: RawCVObject
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

export const enhanceResponseSchema = z.object({
	"cv": z.any(),
	"metadata": z.object({
		"job_posting_title": z.string(),
		"company_name": z.string(),
		"edits": z.array(
			z.string()
		)
	})
})

export function useCVs() {
	// setOriginalCV - set the CV PDF to be processed
	// addRequest - adds a request / pending CV to the list
    // deleteCV - removes a CV from the list regardless of state

	const api = useAPI(); // Get API
	const [originalCV, _setOriginalCV] = useState<File|null>(null); // Store original CV File
	const [originalCVHash, setOriginalCVHash] = useState<string|null>(null); // Store original CV hash (from server)
	const [cvs, setCvs] = useState<CVs>({}); // cvs state for rendering
	const idRef = useRef(0);

	const setOriginalCV = useCallback(async (file: File | null) => {
		if (api !== null) { // Throw error if API is not initialized
			if (file) { // If file has been set to some file
				const uploadResponse = await api.uploadFileUploadPost(file); // Upload file
				console.log(uploadResponse); // This gets the hash of the file
				if (typeof (uploadResponse.data as any)["file_hash"] !== "string") { // Check file upload response has hash
					throw new Error("Invalid response from server");
				}
				_setOriginalCV(file); // Save file object in state
				setOriginalCVHash((uploadResponse.data as any)["file_hash"]); // Save hash in state
			} else { // If file has been set to null
				_setOriginalCV(null);
				setOriginalCVHash(null);
			}
		}
	}, [api, _setOriginalCV]);

	const addRequest = useCallback(async (url: string) => {
		// Current file hash must not be null
		if (originalCVHash === null) {
			throw new Error("No CV uploaded");
		}
		if (api !== null) {
			// Add a request to the list as processing
			const id = idRef.current++;
			setCvs((cvs: CVs) => {
				return {
					...cvs,
					[id]: {
						url,
						processedState: "processing",
						results: null,
						error: null
					}
				}
			});
			const request = {
				file_hash: originalCVHash,
				job_posting_url: url
			}
			console.log(request);
			// Send request to server, and when it comes back, update the state (if it still exists)
			// const response = await api.enhanceCvEnhancePost(request)
			const rawResponse = await api.getDummyRenderDummyGet()
			console.log(rawResponse)
			const response = {
				cv: JSON.parse((rawResponse as any).data.cv.trim()),
				metadata: JSON.parse((rawResponse as any).data.metadata.trim())
			}
			// Let's check against the schema
			console.log(
				response
			)
			const parsedResponse = enhanceResponseSchema.parse(response)
			console.log(parsedResponse)
			setCvs((cvs: CVs) => {
				if (cvs[id]) {
					return {
						...cvs,
						[id]: {
							...cvs[id],
							processedState: "processed",
							results: {
								company: parsedResponse.metadata.company_name,
								jobTitle: parsedResponse.metadata.job_posting_title,
								modifiedCV: parsedResponse.cv as RawCVObject
							}
						}
					}
				} else {
					return cvs;
				}
			})
			console.log(response);
		}
	}, [api, originalCVHash]);

	const deleteCV = useCallback((id: number) => {
		setCvs((cvs: CVs) => {
			const newCVs = { ...cvs };
			delete newCVs[id];
			return newCVs;
		})
	}, [setCvs]);

	return {
		cvs,
		setOriginalCV,
		originalCV,
		addRequest,
		deleteCV,
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
	// const [cvs, setCvs] = useState<CVs>({
	// 	1: {
	// 		url: "https://www.linkedin.com/in/alexander-lee-1b1b3b1b3/",
	// 		processedState: "processing",
	// 		results: null,
	// 		error: null
	// 	},
	// 	2: {
	// 		url: "https://www.linkedin.com/in/alexander-lee-1b1b3b1b3/",
	// 		processedState: "processed",
	// 		results: {
	// 			company: "Google",
	// 			jobTitle: "Software Engineer",
	// 			modifiedCV: "some cv"
	// 		},
	// 		error: null
	// 	},
	// 	3: {
	// 		url: "https://www.linkedin.com/in/alexander-lee-1b1b3b1b3/",
	// 		processedState: "error",
	// 		results: null,
	// 		error: "some error"
	// 	}
	// });
	return (
		<APIProvider url='http://localhost:8020'>
			<AppContextProvider>
				<div className='flex flex-col gap-8 w-[800px] m-4'>
					<Upload/>
				</div>
			</AppContextProvider>
		</APIProvider>
	)
}

export default App