export type CVResult = {
    company_name: string
    job_title: string
    edited_cv: JSON
}

export type CVResults = CVResult[]

export default function ResultBrowser({ results }: { results: CVResults }) {
    return (
        <div>
            {results.map((result, index) => (
                <div key={index}>
                    <h1>{result.company_name}</h1>
                    <h2>{result.job_title}</h2>
                    <div>
                        <pre>{JSON.stringify(result.edited_cv, null, 2)}</pre>
                    </div>
                </div>
            ))}
        </div>
    )
}