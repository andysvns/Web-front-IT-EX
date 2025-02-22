<template>
  <v-container>
    <v-form ref="form" v-model="valid" @submit.prevent="validateAndUpdate">
      <v-row class="ml-5 mr-5">
        <v-col cols="12">
          <v-toolbar flat color="transparent">
            <v-btn icon @click="goBack">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title>Back</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              color="secondary"
              @click="validateAndUpdate"
              :disabled="!valid"
              >Save</v-btn
            >
          </v-toolbar>
        </v-col>
      </v-row>
      <v-row class="ml-5 mr-5">
        <v-col cols="12" md="5">
          <v-card>
            <v-card-title>Image</v-card-title>
            <v-card-text>
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                style="display: none"
                @change="handleImageUpload"
              />
              <v-btn color="secondary" @click="$refs.fileInput.click()">
                Upload Image
              </v-btn>

              <v-img
                :src="
                  displayedImageUrl ||
                  item.img ||
                  require('@/assets/default.png')
                "
                :lazy-src="require('@/assets/default.png')"
                max-height="250"
                contain
                class="mt-6"
                @error="() => handleImageError(item)"
              ></v-img>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="7">
          <v-card>
            <v-card-title>Partner Detail</v-card-title>
            <v-card-text>
              <v-text-field
                label="Name"
                :rules="titleRules"
                v-model="item.partner_name"
                outlined
              ></v-text-field>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>

    <v-snackbar v-model="snackbarSuccess" bottom right color="success">
      <v-icon color="white" left>mdi-check-circle</v-icon>
      Edited item successfully!
      <v-btn color="white" text @click="snackbarSuccess = false">Close</v-btn>
    </v-snackbar>

    <v-snackbar v-model="snackbarError" bottom right color="error">
      <v-icon color="white" left>mdi-alert-circle</v-icon>
      Failed to edit item. Please try again.
      <v-btn color="white" text @click="snackbarError = false">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "ContactForm",
  data() {
    return {
      valid: false,
      snackbarSuccess: false,
      snackbarError: false,
      item: {
        img: "",
        partner_name: "",
        updated_at: "",
      },
      imageFile: null,
      displayedImageUrl: null,
      titleRules: [(v) => !!v || "Name is required"],
      descRules: [(v) => !!v || "Description required"],
    };
  },
  created() {
    this.fetchItemById();
  },
  methods: {
    handleImageError(item) {
      console.error("Image failed to load for item:", item);
      this.$set(item, "img", require("@/assets/default.png"));
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.imageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.displayedImageUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    async fetchItemById() {
      const id = this.$route.params.id;
      console.log("Fetched ID:", id);

      if (!id) {
        console.error("No ID found in route params.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/api/partners/view/${id}`
        );
        this.item = response.data;
      } catch (err) {
        console.error("Failed to fetch item by ID:", err);
      }
    },
    validateAndUpdate() {
      if (this.$refs.form.validate()) {
        this.updateItem();
      } else {
        console.error("Form validation failed");
      }
    },
    async updateItem() {
      const id = this.$route.params.id;
      if (!id) {
        console.error("No ID found in route params.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("partner_name", this.item.partner_name);

        if (this.imageFile) {
          formData.append("img", this.imageFile);
        }

        const response = await axios.put(
          `http://localhost:3000/api/partners/update/${id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200) {
          this.$emit("item-updated", response.data);
          this.snackbarSuccess = true;
          setTimeout(() => {
            this.$router.go(-1);
          }, 1500);
        }
      } catch (err) {
        console.error("Failed to update item:", err);
        this.snackbarError = true;
      }
    },
  },
};
</script>
