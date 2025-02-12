import { useState } from "react";
import "./App.css";

export default function App() {
  const [email, setEmail] = useState("");
  const [userID, setUserID] = useState<ArrayBuffer | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const timeBound = 2 * 60 * 1000;

  const expiresAt = new Date(Date.now() + timeBound).toISOString();

  const deviceBound = navigator.userAgent;

  const registerEmailForVerification = async (e: any) => {
    e.preventDefault();
    let emailRegister = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array(0),
        rp: { id: "localhost", name: "Auth Device" },
        user: {
          id: new Uint8Array(32),
          name: email,
          displayName: email,
        },
        attestation: "none",
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          requireResidentKey: false,
          userVerification: "required",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        timeout: timeBound,
      },
    });

    if (Boolean(emailRegister)) {
      console.log("Biometrics verify ok");
      setUserID((emailRegister as PublicKeyCredential).rawId);
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          deviceID: deviceBound,
          tokenExpires: expiresAt,
        }),
      });

      console.log(res);
      return true;
    }
  };

  const verifyEmail = async (e: any) => {
    e.preventDefault();

    console.log(email);
    console.log(deviceBound);

    let emailCredential = await navigator.credentials.get({
      publicKey: {
        challenge: new Uint8Array(0),
        rpId: "localhost",
        userVerification: "required",
        allowCredentials: [],
      },
    });
    if (emailCredential) {
      console.log(email);
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        body: JSON.stringify({
          email: email,
          deviceID: navigator.userAgent.toString(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const result = await res.json();
        console.log(result);
      }
    } else {
      setError("Unauthorized credential");
    }
  };

  return (
    <div className="container">
      <h1>Email Biometric Form</h1>

      <input type="email" onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" onClick={registerEmailForVerification}>
        Submit with Touch ID
      </button>
      <button type="submit" onClick={verifyEmail}>
        Verify with Touch ID
      </button>
    </div>
  );
}
