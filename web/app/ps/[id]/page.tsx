"use client";

import { Button, TextareaAutosize } from "@mui/material";
import "../../globals.css";
import { useEffect, useRef, useState } from "react";
import { collection, getDocs, query, where } from "@firebase/firestore";
import db from "@/utils/initDB";
import { Splash } from "@/components/general/Splash";
import ProgressBar from "@ramonak/react-progress-bar";
import { NewModal } from "@/components/general/newModal";

import generatePDF from "react-to-pdf";

export default function ProblemSetViewer({
  params,
}: {
  params: { id: string };
}) {
  const targetRef = useRef();

  const [ps, setPs] = useState<any>();
  const [checkedQuestions, setCheckedQuestions] = useState<string[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [generating, setGenerating] = useState(false);

  function test(n) {
    if (n < 0) return false;

    // Arrays to hold words for single-digit, double-digit, and below-hundred numbers
    let single_digit = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    let double_digit = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    let below_hundred = [
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (n === 0) return "Zero";

    // Recursive function to translate the number into words
    function translate(n) {
      let word = "";
      if (n < 10) {
        word = single_digit[n] + " ";
      } else if (n < 20) {
        word = double_digit[n - 10] + " ";
      } else if (n < 100) {
        let rem = translate(n % 10);
        word = below_hundred[(n - (n % 10)) / 10 - 2] + " " + rem;
      } else if (n < 1000) {
        word =
          single_digit[Math.trunc(n / 100)] + " Hundred " + translate(n % 100);
      } else if (n < 1000000) {
        word =
          translate(parseInt((n / 1000) as any)).trim() +
          " Thousand " +
          translate(n % 1000);
      } else if (n < 1000000000) {
        word =
          translate(parseInt((n / 1000000) as any)).trim() +
          " Million " +
          translate(n % 1000000);
      } else {
        word =
          translate(parseInt((n / 1000000000) as any)).trim() +
          " Billion " +
          translate(n % 1000000000);
      }
      return word;
    }

    // Get the result by translating the given number
    let result = translate(n);
    return result.trim().toLowerCase();
  }

  useEffect(() => {
    const q = query(
      collection(db, "problemsets"),
      where("docid", "==", params.id),
    );
    if (params.id) {
      console.log("hey");
      getDocs(q).then((res) => setPs(res.docs[0].data()));
    }
    console.log(test(2));
  }, [params.id]);

  if (showQuiz) {
    if (ps.type === "FRQ") {
      return (
        <>
          <NewModal modal={showQuiz} setModal={setShowQuiz}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <h1
                className="text-gradient-black"
                style={{ fontSize: "4vw", marginTop: 120 }}
              >
                {ps.problemSetName}
              </h1>

              <div>
                <Button
                  variant="outlined"
                  style={{ marginTop: 40, marginRight: 30 }}
                  onClick={() => setShowQuiz(false)}
                >
                  Exit Quiz
                </Button>
                <Button
                  variant="outlined"
                  style={{ marginTop: 40 }}
                  onClick={async () => {
                    setGenerating(true);
                    await generatePDF(targetRef, {
                      filename: `${ps.problemSetName}.pdf`,
                    });
                    setGenerating(false);
                  }}
                >
                  Print
                </Button>
              </div>
            </div>
            <div
              style={{
                width: "80%",
                border: "2px solid #eee",
                height: "100%",
                marginTop: 50,
                minHeight: "100vh",
              }}
              ref={targetRef as any}
            >
              <div style={{ display: "flex", flexDirection: "row" }}>
                <img src="/logo.png" style={{ width: 40, margin: 30 }} alt="" />
                <p
                  style={{
                    textAlign: "left",
                    fontWeight: "bold",
                    marginTop: 40,
                    right: 240,
                    position: "absolute",
                  }}
                >
                  Generated By Vertex
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <h1
                  style={{
                    marginTop: 100,
                    fontFamily: "serif",
                    textAlign: "left",
                    fontWeight: "bold",
                    fontSize: 40,
                    color: "#000",
                  }}
                >
                  {ps.problemSetName}
                </h1>
              </div>
              {ps.questionSet.map((q) => {
                return (
                  <div style={{ margin: 50 }}>
                    <h1
                      style={{
                        fontWeight: "bold",
                        fontSize: 22,
                        color: "#000",
                        fontFamily: "serif",
                      }}
                    >
                      {q.questionNumber}.) {q.overallQuestion}
                    </h1>
                    <ul style={{ marginTop: 30 }}>
                      {q.questionByPartWithLetter.map((part) => (
                        <>
                          <li
                            style={{
                              fontSize: 22,
                              fontFamily: "serif",
                              marginBottom: 50,
                              color: "#000",
                            }}
                          >
                            {part}
                          </li>

                          <TextareaAutosize
                            id="outlined-basic"
                            placeholder="Type response..."
                            // value={prompt}
                            style={{
                              width: "100%",
                              border: "0px solid #CBCBCB",
                              borderRadius: 5,
                              resize: "none",
                              padding: 20,
                              outline: "none",
                              marginTop: generating ? 100 : 0,
                              fontFamily: "serif",
                              marginBottom: 100,
                            }}
                            onChange={(e) => {
                              // setPrompt(e.currentTarget.value);
                            }}
                            color={prompt.length > 0 ? "primary" : "error"}
                          />
                        </>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </NewModal>
        </>
      );
    } else
      return (
        <>
          <NewModal modal={showQuiz} setModal={setShowQuiz}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <h1
                className="text-gradient-black"
                style={{ fontSize: "4vw", marginTop: 120 }}
              >
                {ps.problemSetName}
              </h1>
              <Button
                variant="outlined"
                style={{ marginTop: 40 }}
                onClick={() => setShowQuiz(false)}
              >
                Exit Quiz
              </Button>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {ps.questionSet.map((q) => {
                  return (
                    <div
                      className="quizcontainer"
                      style={{ width: "40%", marginBottom: 50 }}
                    >
                      <h2
                        className="text-gradient-black"
                        style={{ fontSize: 30 }}
                      >
                        Question #{q.questionNumber}:
                      </h2>
                      <h2 style={{ fontSize: 22, marginTop: 30 }}>
                        {q.question}
                      </h2>

                      <ul>
                        {q.optionsWithoutLetter.map((o, idx) => (
                          <li
                            style={{
                              minHeight: 100,
                              height: "100%",
                              marginBottom: 10,
                            }}
                          >
                            <input
                              type="radio"
                              id={`${o}-option`}
                              name="selector"
                            />
                            <label
                              htmlFor={`${o}-option`}
                              style={{
                                color: checkedQuestions.includes(q.question)
                                  ? q.correctAnswerOption == o
                                    ? "green"
                                    : "red"
                                  : "",
                                height: "100%",
                                marginBottom: -20,
                                fontWeight: "bold",
                              }}
                            >
                              {o}
                            </label>

                            <div className="check"></div>
                            {checkedQuestions.includes(q.question) && (
                              <p
                                style={{
                                  color:
                                    q.correctAnswerOption == o
                                      ? "green"
                                      : "red",
                                  padding: `5px 5px 5px 80px`,
                                  fontStyle: "italic",
                                }}
                              >
                                {
                                  q.answerChoiceExplanations[
                                    `choice${test(idx + 1)}`
                                  ]
                                }
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                      <Button
                        style={{ marginTop: 40 }}
                        variant="outlined"
                        color="success"
                        onClick={() =>
                          setCheckedQuestions([...checkedQuestions, q.question])
                        }
                      >
                        Check Answer
                      </Button>
                    </div>
                  );
                })}
                {/* <button
                className={"primary-effect"}
                style={{
                  width: 400,
                  borderRadius: 200,
                  bottom: 50,
                  cursor: "pointer",
                  position: "fixed",
                }}
                onClick={async () => {
                  // firebase save
                }}
              >
                <span
                  style={{
                    cursor: "pointer",
                  }}
                >
                  Submit
                </span>
              </button> */}
              </div>
            </div>
          </NewModal>
        </>
      );
  }

  if (!ps) return <Splash></Splash>;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div className="header">
          <a
            className="fa fa-home fa-2x"
            style={{
              color: "#fff",
              position: "absolute",
              top: 40,
              left: 40,
              zIndex: 1000000,
              fontSize: 22,
            }}
            href="/questiongenerate"
          >
            Back
          </a>
          <div
            className="inner-header myflex"
            style={{ flexDirection: "column" }}
          >
            <h1
              style={{
                fontWeight: "bold",
                textTransform: "uppercase",
                top: -50,
                position: "relative",
              }}
            >
              {ps.chosenClass}
            </h1>
            <h1
              style={{
                fontSize: "4vw",
                fontWeight: "bold",
                maxWidth: "80%",
              }}
            >
              {ps.problemSetName}
            </h1>
            <p style={{ marginTop: 40, color: "lightgray", maxWidth: "40%" }}>
              {ps.problemSetDescription}
            </p>
            <Button
              style={{ backgroundColor: "#fff", color: "#000", marginTop: 40 }}
              onClick={() => {
                setShowQuiz(true);
              }}
            >
              Start Problem Set
            </Button>
          </div>
          <div>
            <svg
              className="waves"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 24 150 28"
              preserveAspectRatio="none"
              shape-rendering="auto"
            >
              <defs>
                <path
                  id="gentle-wave"
                  d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
                />
              </defs>
              <g className="parallax">
                <use
                  xlinkHref="#gentle-wave"
                  x="48"
                  y="0"
                  fill="rgba(255,255,255,0.7"
                />
                <use
                  xlinkHref="#gentle-wave"
                  x="48"
                  y="3"
                  fill="rgba(255,255,255,0.5)"
                />
                <use
                  xlinkHref="#gentle-wave"
                  x="48"
                  y="5"
                  fill="rgba(255,255,255,0.3)"
                />
                <use xlinkHref="#gentle-wave" x="48" y="7" fill="#fff" />
              </g>
            </svg>
          </div>
        </div>

        <h1
          style={{
            marginTop: 40,
            fontWeight: "bold",
            fontSize: "2vw",
            color: "#000",
            textAlign: "center",
          }}
          className="text-gradient-black"
        >
          Discussion Thread
        </h1>
      </div>
    </>
  );
}
