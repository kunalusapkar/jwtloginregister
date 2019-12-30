const register = async (name, email, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: "POST",
            url: "http://localhost:3000/api/v1/users/signup",
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        });
        console.log(res);
        if (res.data.status === "success") {
            alert("You are registered succesfully");
            window.setTimeout(() => {
                location.assign("/");
            }, 1500);
        }
    } catch (error) {
        alert(error.response.data.message);
        console.log(error);
    }
};

document.querySelector("#registerform").addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("confirmPassword").value;
    register(name, email, password, passwordConfirm);
});