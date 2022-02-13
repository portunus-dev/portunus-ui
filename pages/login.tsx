import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { PORTUNUS_API } from "../utils/api";
import { useAuth } from "../hooks/auth";

const getOTP = (email: string) => {
  const url = new URL(`${PORTUNUS_API}/otp`);
  url.searchParams.append("user", email);
  url.searchParams.append("origin", `${window.location.origin}/login`);
  return fetch(url.toString()).then((res) => res.json())
}

const validateOTP = (query: any) => { // TODO: do proper type here
  const { user, otp } = query;
  if (!user || !otp) {
    throw new Error("Invalid user (email) or OTP");
  }
  const url = new URL(`${PORTUNUS_API}/login`);
  url.searchParams.append("user", user);
  url.searchParams.append("otp", otp);
  return fetch(url.toString())
    .then((res) => res.json())
    .then(({ jwt }) => {
      if (!jwt) {
        throw new Error("Unable to validate OTP");
      }
      return jwt
    })
}

const Login = () => {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();
  useEffect(() => { // already logged in
    if (isLoggedIn) {
      router.replace("/")
    }
  }, [isLoggedIn])

  const [email, setEmail] = useState<string>(Array.isArray(router.query.user) ? router.query.user[0] : router.query.user || "");
  useEffect(() => {
    const { user, otp } = router.query;
    if (user && otp) {
      validateOTP(router.query).then(jwt => {
        login(jwt);
        router.replace("/");
      }).catch(err => {
        // TODO: show toast or something
        console.error(err);
        router.query = {};
      })
    }
  }, [router.query])

  const [otp, setOTP] = useState<string>("");
  const [otpSending, setOTPSending] = useState<boolean>(false);
  const [otpSent, setOTPSent] = useState<boolean>(false);

  if (isLoggedIn) { // there must be a better way to do more seamlessly
    return (<div>Already logged in, redirecting...</div>)
  }

  if (router.query.user && router.query.otp) {
    return (<div>Logging in...</div>)
  }

  return (
    <>
      <div>
        <input
          type="email" // TODO: leverage email validation
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e?.target?.value || "")}
          disabled={otpSending}
        />
        {/* only enable on email being a valid value? */}
        {!otpSent ? (
          <button
            onClick={() => {
              setOTPSending(true);
              getOTP(email).then((data) => {
                // TODO: show toast or something
                console.log(data);
                setOTPSent(true);
              }).catch((err) => {
                // TODO: show toast or something
                console.error(err);
              }).finally(() => {
                setOTPSending(false);
              })
            }}
            disabled={!email || otpSending}
          >
            Send OTP
          </button>
        ) : (
          // TODO: only show this after perhaps N seconds after "Send OTP"?
          <button
            onClick={() => {
              setOTPSent(false)
              setEmail("")
            }}
          >
            Reset
          </button>
        )}
      </div>
      {otpSent && (
        <div>
          <input
            type="text"
            placeholder="OTP received via email"
            value={otp}
            onChange={(e) => setOTP(e?.target?.value || "")}
          />
          <button
            onClick={() => {
              // leverages the same router.query based useEffect hook above
              router.push({
                pathname: "/login",
                query: { user: email, otp },
              })
            }}
            disabled={!otp}
          >
            Login
          </button>
        </div>
      )}
    </>
  )
}

export default Login
