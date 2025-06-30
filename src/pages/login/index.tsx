import Button from "@/components/Button";
import styles from "./login.module.css";

export default function Dashboard() {
	return (
		<div className={styles.container}>
			<div className={styles.left}>
				<div className={styles.content}>
					<div>Header</div>
					<div>Body</div>
					<div>Footer</div>
				</div>
			</div>
			<div className={styles.center} />
			<div className={styles.right}>
				<div className={styles.content}>
					<div>
						<img src="shelf_long.png" alt="vegi shelf header" />
					</div>
					<div>
						<h1>Welcome</h1>
						<p>Choose an option below to get started</p>
						<div className={styles.buttonContainer}>
							<Button startImage="google.png">Continue With Google</Button>
							<Button startImage="fb.png">Continue With Facebook</Button>
							<Button startImage="reddit.png">Continue With Reddit</Button>
							<Button startImage="yahoo.png">Continue With Yahoo</Button>
						</div>
					</div>
					<div>
						<img src="pancakes.png" alt="pile of pancakes footer" />
					</div>
				</div>
			</div>
		</div>
	);
}
