import { InputProps } from 'antd/lib/input';
import { InputMask, MaskProps } from '@react-input/mask';
import { forwardRef, KeyboardEvent } from 'react';

interface MaskedInputProps extends InputProps {
    mask: MaskProps["mask"];
    replacement: MaskProps["replacement"];
}

export const AntMaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>((props, ref) => {


    return <InputMask 
        mask={props.mask}
        replacement={props.replacement}
        className="ant-input"
        style={{
            lineHeight: 2,
            borderRadius: 6,
            border: '1px solid #d9d9d9',
            padding: 4,
            paddingLeft: 10,
            width: 'calc(100% - 16px)'
        }}
        onKeyDown={props.onKeyDown}
        ref={ref}
        autoFocus={props.autoFocus}
        placeholder={props.placeholder}
        value={props.value as number}
        onChange={props.onChange} 

    />;
});

export function focusNext(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
        const target: HTMLInputElement  = e.currentTarget;
        const form = target.form
        if (form == null) return false;
        const inputs = Array.from(form.getElementsByTagName('input'));
        const idx = inputs.indexOf(target);
        if (idx === -1) {
            console.log("Element not found in the array, maybe it's not and input", target);
            return false;
        }
        if (idx + 1 < inputs.length) {
            inputs[idx + 1].focus();
            return true;
        }
    }
    return false

};
