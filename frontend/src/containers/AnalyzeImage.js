import React from "react";
import { useSessionStorage } from "../lib/hooksLib";


export default function AnalyzeImage() {
    const [picture, setPicture] = useSessionStorage("picture", null);
    
}