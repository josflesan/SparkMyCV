import { useState } from 'react'
import ResultBrowser, { CVResults } from './components/Result';
import Upload from './components/Upload';
import { Configuration, DefaultApi } from './api';
import { APIProvider } from './APIProvider';

function App() {
	const [results, setResults] = useState<CVResults|null>(null)
	return (
		<APIProvider url='http://localhost:8080'>
			<div className='flex flex-col gap-8 w-[800px] m-4'>
				{
					results === null ?
					<Upload setResults={setResults} /> :
					<ResultBrowser results={results} />
				}
			</div>
		</APIProvider>
	)
}

export default App