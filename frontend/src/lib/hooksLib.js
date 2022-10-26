import { useState, useEffect } from "react";


export function useFormFields(initialState) {
    const [fields, setValues] = useState(initialState);

    return [
        fields,
        function (event) {
            setValues({
                ...fields,
                [event.target.id]: event.target.value,
            });
        },
    ];
}

export function useLocalStorage(storageKey, fallbackState) {
    const [value, setValue] = useState(
      JSON.parse(localStorage.getItem(storageKey)) ?? fallbackState
    );
  
    useEffect(() => {
      localStorage.setItem(storageKey, JSON.stringify(value));
    }, [value, storageKey]);
  
    return [value, setValue];
  };

  export function useSessionStorage(storageKey, fallbackState) {
    const [value, setValue] = useState(
      sessionStorage.getItem(storageKey) ?? fallbackState
    );
  
    useEffect(() => {
      sessionStorage.setItem(storageKey, value);
    }, [value, storageKey]);
  
    return [value, setValue];
  };

  