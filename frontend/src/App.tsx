import { useState } from 'react'
import ResultBrowser, { CVResults } from './components/Result';
import Upload from './components/Upload';

function App() {
	const [results, setResults] = useState<CVResults|null>(null)
	return (
		<div className='flex flex-col gap-8 w-[800px] m-4'>
			{
				results === null ?
				<Upload setResults={setResults} /> :
				<ResultBrowser results={results} />
			}
		</div>
		
	)
}

export default App