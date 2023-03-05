import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { render } from 'react-dom';
import arimo from "../../assets/arimo.ttf?url"
import nanum from "../../assets/nanum.ttf"
import nanum_bold from "../../assets/nanum-bold.ttf"
import nanum_extra_bold from "../../assets/nanum-extra-bold.ttf"
import { nan } from 'zod';

export type RawCVComponentObject = {
    type: "bullet" | "p" | "h1" | "h2" | "h3" | "div"
    content: RawCVComponentChildren
}

export type RawCVComponentChildren = string | ((RawCVComponentObject | string)[])

export type WithType<T, U> = T & { type: U }

export type RawCVObject = RawCVComponentObject[]

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        fontFamily: 'Arimo',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Nanum',
        marginBottom: 10,
    },
    subheader: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Nanum',
        marginBottom: 10,
    },
    subsubheader: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Nanum',
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 12,
        marginBottom: 10,
        fontFamily: 'Arimo',
    },
    container: {
        display: "flex",
        flexDirection: 'column'
    },
    row: {
        display: 'flex',
        fontFamily: 'Arimo',
        flexDirection: 'row'
    },
    bullet: {
        height: '100%',
        fontFamily: 'Arimo',
        flexWrap: "nowrap"
    }
});

Font.register(
    {
        family: 'Arimo',
        src: arimo
    }
)

Font.register(
    {
        family: "Nanum",
        fonts: [
            {
                src: nanum,
                fontWeight: 400
            },
            {
                src: nanum_bold,
                fontWeight: 600
            },
            {
                src: nanum_extra_bold,
                fontWeight: 700
            }
        ]
    }
)

function renderChildren(children: RawCVComponentChildren, parentType: RawCVComponentObject["type"]) {
    if (typeof children === "string") {
        return children;
    } else {
        return children.map((child, index) => {
            if (typeof child === "string") {
                return <CVRendererAssigner key={index} cv={{
                    type: parentType,
                    content: child
                }} />
            } else {
                return <CVRendererAssigner key={index} cv={child} />
            }
        })
    }
}

function BulletItem({ children }: { children: string }) {
    return (
        <View style={styles.row} wrap={false}>
            <View style={styles.bullet} wrap={false}>
                <Text>{'\u2022' + " "}</Text>
            </View>
            <Text>{`${children}\n`}</Text>
        </View>
    )
}

function BulletRenderer({ content }: WithType<RawCVComponentObject, "bullet">) {
    const children = renderChildren(content, "bullet")
    return (
        <Text style={styles.paragraph}>
            {   
                (typeof children === "string") ? <BulletItem>
                    {children}
                </BulletItem> : children
            }
        </Text>
    )
}

function PRenderer({ content }: WithType<RawCVComponentObject, "p">) {
    const children = renderChildren(content, "p")
    return (
        <Text style={styles.paragraph}>
        {
            (typeof children === "string") ? `${children}\n` : children
        }
        </Text>
    )
}

export function DivRenderer({ content }: WithType<RawCVComponentObject, "div">) {
    const children = renderChildren(content, "div")
    return (
        <View style={styles.container}>
            {
                (typeof children === "string") ? <Text style={styles.paragraph}>{`${children}\n`}</Text> :
                children
            }
        </View>
    )
}


export function H1Renderer({ content }: WithType<RawCVComponentObject, "h1">) {
    return (
        <Text style={styles.header}>
            {renderChildren(content, "h1")}
        </Text>
    )
}

function H2Renderer({ content }: WithType<RawCVComponentObject, "h2">) {
    return (
        <Text style={styles.subheader}>
            {renderChildren(content, "h2")}
        </Text>
    )
}

function H3Renderer({ content }: WithType<RawCVComponentObject, "h3">) {
    return (
        <Text style={styles.subsubheader}>
            {'\n'}
            {renderChildren(content, "h3")}
        </Text>
    )
}

function CVRendererAssigner({ cv }: { cv: RawCVComponentObject }): JSX.Element {
    switch (cv.type) {
        case "bullet":
            return <BulletRenderer {...cv as WithType<RawCVComponentObject, "bullet">} />
        case "p":
            return <PRenderer {...cv as WithType<RawCVComponentObject, "p">} />
        case "h1":
            return <H1Renderer {...cv as WithType<RawCVComponentObject, "h1">} />
        case "h2":
            return <H2Renderer {...cv as WithType<RawCVComponentObject, "h2">} />
        case "h3":
            return <H3Renderer {...cv as WithType<RawCVComponentObject, "h3">} />
        case "div":
            return <DivRenderer {...cv as WithType<RawCVComponentObject, "div">} /> // Hack!
    }
}

export function CVDocument({ content }: { content: RawCVObject }) {
    return (
        <Document>
            <Page size="A4" style={
                styles.page
            }>
                {content.map((cv, index) => <CVRendererAssigner key={index} cv={cv} />)}
            </Page>
        </Document>
    )
}