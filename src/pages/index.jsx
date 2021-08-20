import React, { useEffect, useRef, useState } from 'react';

export default function Home() {
    const label_input = useRef("");
    const color_input = useRef("");
    //  const [colors, setColors] = useState([]);
    const colors = []
    const saveColor = async event => {
        colors.push(event.target.value)
        console.log("teste", colors)
        label_input.current.value
    }
    useEffect(() => {
        console.log("render")

    })

    return <section>
        <form method="get" action="">

            <input ref={label_input} type="text" name="label" placeholder="rotulo" onChange={saveColor} />
            <input ref={color_input} type="color" name="color" placeholder="cor" onChange={saveColor} />

        </form>
    </section>

}