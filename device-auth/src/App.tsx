import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [email, setEmail] = useState("");
  const [userID, setUserID] = useState<ArrayBuffer | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const timeBound = 1 * 60 * 1000;
  const expiresAt = new Date(Date.now() + timeBound).toISOString();
  const deviceBound = navigator.userAgent;

  useEffect(() => {
    const tokenAvailable = localStorage.getItem("token");

    if (tokenAvailable) {
      const parsedToken = JSON.parse(tokenAvailable);
      console.log(parsedToken.timeBound);
      console.log(new Date(Date.now()).toISOString());

      if (new Date(Date.now()).toISOString() >= parsedToken.timeBound) {
        console.log("Token expired. Removing...");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const registerEmailForVerification = async (e: any) => {
    e.preventDefault();
    let emailRegister = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array([]),
        rp: { id: "localhost", name: "Auth Device" },
        user: {
          id: new Uint8Array([]),
          name: email,
          displayName: email,
        },
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          requireResidentKey: false,
          userVerification: "required",
        },
        attestation: "none",
        pubKeyCredParams: [],
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

    const checkToken = localStorage.getItem("token");
    if (checkToken) {
      await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(0),
          rpId: "localhost",
          userVerification: "required",
          allowCredentials: [],
        },
      });
      console.log("Ending biometrics");

      console.log("Token is avaialbe, no need to check server-side");
      const parsedToken = JSON.parse(checkToken);
      const checkCompatible =
        new Date(Date.now()).toISOString() < parsedToken.timeBound &&
        navigator.userAgent === parsedToken.deviceID;

      if (!checkCompatible) {
        return { error: "token expires or device is not ok" };
      }

      console.log("Begin biometrics");
      if (checkCompatible) {
        await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(0),
            rpId: "localhost",
            userVerification: "required",
            allowCredentials: [],
          },
        });
      }

      console.log("End biometrics after verification");

      setMessage("Grant access");
      return { message: "Grant access" };
    } else {
      let emailCredential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array([]),
          rpId: "localhost",
          userVerification: "required",
          allowCredentials: [],
        },
      });
      if (emailCredential) {
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
          setMessage("Grant access");
          return result;
        }
      } else {
        setError("Unauthorized credential");
        return error;
      }
    }
  };

  return (
    <div className="container">
      <h1>Email Biometric Form</h1>

      {<div className="message">{message}</div>}
      {error && <div className="message">{error}</div>}
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
