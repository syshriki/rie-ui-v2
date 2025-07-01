import { useEffect, useRef } from "react";

interface ChefyProps {
	width: string | number;
	height: string | number;
}

const chefy = {
	leftShoulder: "646.18px 511.46px",
	leftElbow: "505.97096px 539.49915px",
	leftHandFinger1: "440.13px 496.22px",
	leftHandFinger2: "438.91px 496.22px",
	leftHandFinger3: "439.52px 495.61px",
};

const timeline = {
	duration: 10000,
	iterations: Number.POSITIVE_INFINITY,
	easing: "ease-in-out",
};

const smokeTimeline = {
	duration: 500,
	iterations: Number.POSITIVE_INFINITY,
	easing: "steps(3)",
};

function animateLeftArmUpper(svgElement: SVGElement) {
	const leftArmUpperRef = svgElement.querySelector(
		"#left_arm_upper",
	) as SVGElement | null;

	if (!leftArmUpperRef) {
		console.error("Left arm upper element not found");
		return;
	}

	return leftArmUpperRef.animate(
		[
			{ transform: "rotate(-30deg)", transformOrigin: chefy.leftShoulder },
			{ transform: "rotate(-15deg)" },
			{ transform: "rotate(-30deg)" },
			{ transform: "rotate(-15deg)" },
			{ transform: "rotate(-30deg)" },
			{ transform: "rotate(-30deg)", offset: 0.025 },
			{
				transform: "rotate(-30deg)",
				transformOrigin: chefy.leftShoulder,
				offset: 0.4,
			},
			{
				transform: "rotate(0deg)",
				transformOrigin: chefy.leftShoulder,
				offset: 0.41,
			},
			{
				transform: "rotate(0deg)",
				transformOrigin: chefy.leftShoulder,
				offset: 0.6,
			},
			{
				transform: "rotate(-30deg)",
				transformOrigin: chefy.leftShoulder,
				offset: 0.63,
			},
			{ transform: "rotate(-30deg)", transformOrigin: chefy.leftShoulder },
		],
		timeline,
	);
}

function animateHead(svgElement: SVGElement) {
	const headRef = svgElement.querySelector("#head") as SVGElement | null;
	console.log(svgElement);
	if (!headRef) {
		console.error("Head element not found");
		return;
	}

	return headRef.animate(
		[
			{
				transform: "rotate(-18deg)",
				offset: 0,
				transformOrigin: "646px 363px",
			},
			{
				transform: "rotate(-18deg)",
				offset: 0.4,
				transformOrigin: "646px 363px",
			},
			{
				transform: "rotate(15deg)",
				offset: 0.41,
				transformOrigin: "646px 363px",
			},
			{
				transform: "rotate(15deg)",
				offset: 0.5,
				transformOrigin: "646px 363px",
			},
			{
				transform: "rotate(15deg)",
				offset: 0.6,
				transformOrigin: "646px 363px",
			},
			{
				transform: "rotate(-18deg)",
				offset: 0.61,
				transformOrigin: "646px 363px",
			},
			{ transform: "rotate(-18deg)", transformOrigin: "646px 363px" },
		],
		timeline,
	);
}

function animateLeftArmHand(svgElement: SVGElement) {
	const leftArmHandRef = svgElement.querySelector(
		"#left_arm_hand",
	) as SVGElement | null;

	if (!leftArmHandRef) {
		console.error("Left arm hand element not found");
		return;
	}

	return leftArmHandRef.animate(
		[
			{
				transform: "rotate(-10deg) translateY(70px) translateX(25px)",
				transformOrigin: chefy.leftElbow,
			},
			{
				transform: `rotate(-30deg) translateY(44px) translateX(${25 - 17}px)`,
				transformOrigin: "502.97096px 572.49915px",
			},
			{
				transform: `rotate(-10deg) translateY(70px) translateX(${25 + 17}px)`,
				transformOrigin: "511.97096px 615.49915px",
			},
			{
				transform: `rotate(-30deg) translateY(44px) translateX(${25 - 17}px)`,
				transformOrigin: "502.97096px 575.49915px",
			},
			{
				transform: `rotate(-10deg) translateY(70px) translateX(${25}px)`,
				transformOrigin: chefy.leftElbow,
			},
			{
				transform: "rotate(-10deg) translateY(70px) translateX(27px)",
				transformOrigin: chefy.leftElbow,
				offset: 0.025,
			},
			{
				transform: "rotate(-10deg) translateY(70px) translateX(25px)",
				transformOrigin: chefy.leftElbow,
				offset: 0.4,
			},
			{
				transform: "rotate(0deg)",
				transformOrigin: chefy.leftElbow,
				offset: 0.41,
			},
			{
				transform: "rotate(0deg)",
				transformOrigin: chefy.leftElbow,
				offset: 0.6,
			},
			{
				transform: "rotate(-10deg) translateY(70px) translateX(25px)",
				transformOrigin: chefy.leftElbow,
				offset: 0.63,
			},
			{
				transform: "rotate(-10deg) translateY(70px) translateX(25px)",
				transformOrigin: chefy.leftElbow,
			},
		],
		timeline,
	);
}

function animatePan(svgElement: SVGElement) {
	const panRef = svgElement.querySelector("#pan") as SVGElement | null;
	const panTranslateX = 10;
	const panTranslateY = "translateY(80px)";
	if (!panRef) {
		console.error("Pan element not found");
		return;
	}
	return panRef.animate(
		[
			{
				transform: `rotate(-30deg) ${panTranslateY} translateX(${panTranslateX}px)`,
				transformOrigin: chefy.leftHandFinger2,
			},
			{
				transform: `rotate(-30deg) ${panTranslateY} translateX(${panTranslateX - 24}px)`,
			},
			{
				transform: `rotate(-30deg) ${panTranslateY} translateX(${panTranslateX + 24}px)`,
			},
			{
				transform: `rotate(-30deg) ${panTranslateY} translateX(${panTranslateX - 28}px)`,
			},
			{
				transform: `rotate(-30deg) ${panTranslateY} translateX(${panTranslateX}px)`,
			},
			{
				transform: `rotate(-30deg) ${panTranslateY} translateX(${panTranslateX}px)`,
				offset: 0.025,
			},
			{
				transform: `rotate(-30deg) ${panTranslateY} translateX(${panTranslateX}px)`,
				offset: 0.4,
			},
			{
				transform: "rotate(0deg)",
				transformOrigin: chefy.leftHandFinger2,
				offset: 0.41,
			},
			{
				transform: "rotate(0deg)",
				transformOrigin: chefy.leftHandFinger2,
				offset: 0.6,
			},
			{
				transform: `rotate(-30deg) ${panTranslateY} translateX(${panTranslateX}px)`,
				transformOrigin: chefy.leftHandFinger2,
				offset: 0.63,
			},
			{
				transform: `rotate(-30deg) ${panTranslateY} translateX(${panTranslateX}px)`,
				transformOrigin: chefy.leftHandFinger2,
			},
		],
		timeline,
	);
}

function animatePancake(svgElement: SVGElement) {
	const pancakeRef = svgElement.querySelector("#pancake") as SVGElement | null;
	const pancakeScale = "scale(0.7)";

	if (!pancakeRef) {
		console.error("Pancake element not found");
		return;
	}

	return pancakeRef.animate(
		[
			{
				transform: `translateX(-80px) translateY(200px) ${pancakeScale} rotate(60deg)`,
				offset: 0,
				transformOrigin: "300px 150px",
			},
			{
				transform: `translateX(-80px) translateY(200px) ${pancakeScale} rotate(60deg)`,
				offset: 0.4,
				transformOrigin: "300px 150px",
			},
			{
				transform: `translateX(-80px) translateY(-70px) ${pancakeScale} rotate(240deg)`,
				offset: 0.41,
				transformOrigin: "300px 150px",
			},
			{
				transform: `translateX(-80px) translateY(-70px) ${pancakeScale} rotate(780deg)`,
				offset: 0.5,
				transformOrigin: "300px 150px",
			},
			{
				transform: `translateX(-80px) translateY(-70px) ${pancakeScale} rotate(1500deg)`,
				offset: 0.6,
				transformOrigin: "300px 150px",
			},
			{
				transform: `translateX(-80px) translateY(200px) ${pancakeScale} rotate(1500deg)`,
				offset: 0.61,
				transformOrigin: "300px 150px",
			},
			{
				transform: `translateX(-80px) translateY(200px) ${pancakeScale} rotate(1500deg)`,
				transformOrigin: "300px 150px",
			},
		],
		timeline,
	);
}

function animateSmoke1(svgElement: SVGElement) {
	const smoke1Ref = svgElement.querySelector("#smoke_1") as SVGElement | null;
	if (!smoke1Ref) {
		console.error("Smoke 1 element not found");
		return;
	}

	return smoke1Ref.animate(
		[
			{
				transform: "translateY(-50px) scaleX(1)",
				transformOrigin: "310px 0px",
			},
			{
				transform: "translateY(-50px) scaleX(-1)",
				transformOrigin: "180px 0px",
			},
			{
				transform: "translateY(-50px) scaleX(1)",
				transformOrigin: "180px 0px",
			},
			{
				transform: "translateY(-50px) scaleX(-1)",
				transformOrigin: "180px 0px",
			},
		],
		smokeTimeline,
	);
}

function animateSmoke2(svgElement: SVGElement) {
	const smoke2Ref = svgElement.querySelector("#smoke_2") as SVGElement | null;
	if (!smoke2Ref) {
		console.error("Smoke 2 element not found");
		return;
	}

	return smoke2Ref.animate(
		[
			{
				transform: "translateY(-50px) scaleX(1)",
				transformOrigin: "300px 0px",
			},
			{
				transform: "translateY(-50px) scaleX(-1)",
				transformOrigin: "220px 0px",
			},
			{
				transform: "translateY(-50px) scaleX(1)",
				transformOrigin: "220px 0px",
			},
			{
				transform: "translateY(-50px) scaleX(-1)",
				transformOrigin: "220px 0px",
			},
		],
		smokeTimeline,
	);
}

function animateSmoke3(svgElement: SVGElement) {
	const smoke3Ref = svgElement.querySelector("#smoke_3") as SVGElement | null;
	if (!smoke3Ref) {
		console.error("Smoke 3 element not found");
		return;
	}

	return smoke3Ref.animate(
		[
			{
				transform: "translateX(20px) translateY(-50px) scaleX(-1)",
				transformOrigin: "290px 0px",
			},
			{
				transform: "translateX(20px) translateY(-50px) scaleX(1)",
				transformOrigin: "285px 0px",
			},
			{
				transform: "translateX(20px) translateY(-50px) scaleX(-1)",
				transformOrigin: "285px 0px",
			},
			{
				transform: "translateX(20px) translateY(-50px) scaleX(1)",
				transformOrigin: "285px 0px",
			},
		],
		smokeTimeline,
	);
}

function initializeAnimation(svgElement: SVGGElement): Animation[] {
	return [
		animateLeftArmUpper(svgElement),
		animateHead(svgElement),
		animatePancake(svgElement),
		animatePan(svgElement),
		animateSmoke1(svgElement),
		animateSmoke2(svgElement),
		animateSmoke3(svgElement),
		animateLeftArmHand(svgElement),
	].filter((animation) => animation !== undefined);
}
export default function Chefy({ width, height }: ChefyProps) {
	const imgRef = useRef<HTMLObjectElement | null>(null);

	return (
		<object
			title="Chefy"
			data="/chefy.svg"
			type="image/svg+xml"
			ref={imgRef}
			onLoad={() => {
				console.log("SVG loaded");
				const svgDoc = imgRef?.current?.contentDocument as SVGGElement | null;
				if (svgDoc) {
					initializeAnimation(svgDoc);
				} else {
					console.error("SVG document not found or not loaded.");
				}
			}}
			height={height}
			width={width}
		/>
	);
}
