"use client";
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
const Captcha = forwardRef(({ onChange }, ref) => {
    const canvasRef = useRef(null);
    const [captchaText, setCaptchaText] = useState("");
    const [userInput, setUserInput] = useState("");
    const [error, setError] = useState("");
    const generateCaptcha = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
        let text = "";
        for (let i = 0; i < 6; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaText(text);
        setUserInput("");
        setError("");
        if (onChange)
            onChange(false);
        return text;
    };
    const drawCaptcha = (text) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Background with gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#f0f4f8");
        gradient.addColorStop(1, "#e2e8f0");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Add noise lines
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }
        // Add noise dots
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.4)`;
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        // Draw text
        ctx.font = "bold 32px Arial";
        ctx.textBaseline = "middle";
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const x = 20 + i * 30;
            const y = canvas.height / 2;
            // Random rotation
            const angle = (Math.random() - 0.5) * 0.4;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            // Random color
            const color = `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`;
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.fillText(char, 0, 0);
            ctx.strokeText(char, 0, 0);
            ctx.restore();
        }
    };
    const validate = () => {
        const isValid = userInput.toLowerCase() === captchaText.toLowerCase();
        if (!isValid) {
            setError("Invalid CAPTCHA. Please try again.");
            generateNewCaptcha();
        }
        else {
            setError("");
        }
        if (onChange)
            onChange(isValid);
        return isValid;
    };
    const generateNewCaptcha = () => {
        const text = generateCaptcha();
        drawCaptcha(text);
    };
    useImperativeHandle(ref, () => ({
        validate,
        refresh: generateNewCaptcha,
    }));
    useEffect(() => {
        generateNewCaptcha();
    }, []);
    const handleInputChange = (value) => {
        setUserInput(value);
        setError("");
        if (onChange)
            onChange(false);
    };
    return (<div className="space-y-2">
            <Label>Verification Code</Label>
            <div className="flex items-center gap-2">
                <canvas ref={canvasRef} width={200} height={60} className="border rounded-md bg-gray-50"/>
                <Button type="button" variant="outline" size="icon" onClick={generateNewCaptcha} title="Refresh CAPTCHA">
                    <RefreshCw className="h-4 w-4"/>
                </Button>
            </div>
            <Input type="text" placeholder="Enter the code above" value={userInput} onChange={(e) => handleInputChange(e.target.value)} maxLength={6}/>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>);
});
Captcha.displayName = "Captcha";
export default Captcha;
