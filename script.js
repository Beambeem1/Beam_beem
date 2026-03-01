import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'ใส่ URL ของคุณ'
const supabaseKey = 'ใส่ anon key ของคุณ'

const supabase = createClient(supabaseUrl, supabaseKey)

let currentUser = null

window.setUser = function() {
  currentUser = document.getElementById("username").value
  document.getElementById("currentUser").innerText = "User: " + currentUser
}

// ================= ADD PROFILE =================

window.addProfile = async function() {

  if (!currentUser) {
    alert("ตั้งชื่อ user ก่อน")
    return
  }

  const name = document.getElementById("name").value
  const age = document.getElementById("age").value
  const gender = document.getElementById("gender").value
  const bio = document.getElementById("bio").value

  await supabase.from("profiles").insert([
    { owner: currentUser, name, age, gender, bio }
  ])

  loadProfiles()
}

// ================= LOAD =================

async function loadProfiles() {

  const { data } = await supabase.from("profiles").select("*")

  const container = document.getElementById("profiles")
  container.innerHTML = ""

  data.forEach(profile => {
    container.innerHTML += `
      <div class="card">
        <h3>${profile.name} (${profile.age})</h3>
        <p>${profile.bio}</p>
        <p>❤️ ${profile.likes}</p>
        <button onclick="likeProfile(${profile.id})">ไลค์</button>
      </div>
    `
  })
}

// ================= LIKE =================

window.likeProfile = async function(id) {

  if (!currentUser) {
    alert("ตั้งชื่อ user ก่อน")
    return
  }

  // เช็คว่าไลค์แล้วหรือยัง
  const { data: existing } = await supabase
    .from("likes")
    .select("*")
    .eq("profile_id", id)
    .eq("liked_by", currentUser)

  if (existing.length > 0) {
    alert("ไลค์แล้ว")
    return
  }

  await supabase.from("likes").insert([
    { profile_id: id, liked_by: currentUser }
  ])

  // เพิ่มจำนวนไลค์
  const { data } = await supabase
    .from("profiles")
    .select("likes")
    .eq("id", id)
    .single()

  await supabase
    .from("profiles")
    .update({ likes: data.likes + 1 })
    .eq("id", id)

  loadProfiles()
}

loadProfiles()